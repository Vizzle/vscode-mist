'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process'
import * as net from 'net'
import * as portfinder from 'portfinder'

export default class MistServer {
    private output: vscode.OutputChannel;
    private serverPort: number;
    private server: cp.ChildProcess;
    private client: net.Socket;

    constructor(private context: vscode.ExtensionContext) {
        let serverPath = context.asAbsolutePath('./bin/mistexp');
        this.output = vscode.window.createOutputChannel("Mist Language Server");
        portfinder.basePort = 11001;
        portfinder.getPort({}, (err, port) => {
            if (err) {
                this.output.appendLine("failed to start Mist Language Server. Error: " + err.message);
                return;
            }

            this.server = cp.spawn(serverPath, [`${port}`]);
            this.server.stdout.on("data", out => {
                let str: string;
                if (typeof out === 'string') {
                    str = out;
                }
                else {
                    str = out.toString("utf8");
                }

                if (str === 'prepared') {
                    this.serverPort = port;
                    this.connect();
                }
            });
            this.server.stdout.pipe(process.stdout);
            this.server.stderr.pipe(process.stderr);
            this.server.once("exit", code => {
                this.output.appendLine("Mist Language Server exited");
                this.server = null;
            });
        });
    }

    private connect() {
        let client = new net.Socket();
        client.connect(this.serverPort, "127.0.0.1");
        client.on("error", err => {
            this.output.appendLine("failed to connect Mist Language Server. Error: " + err.message);
        });
        client.once("close", hasError => {
            console.log("socket closed" + (hasError ? " with an error" : ""));
            if (hasError) {
                this.output.appendLine("connection lost due to a transmission error");
            }
            else {
                this.output.appendLine("Mist Language Server disconnected");
            }
            this.client = null;
        });
        client.once("data", data => {
            let str: string;
            if (typeof data === 'string') {
                str = data;
            }
            else {
                str = data.toString("utf8");
            }
            if (str === "Mist Language Server") {
                this.output.appendLine("connected to Mist Language Server");
                this.client = client;
                this.read();
            }
            else {
                this.output.appendLine("failed to connect Mist Language Server.");
            }
        });
    }

    dispose() {
        this.output.hide();
        this.output.dispose();
        if (this.client) {
            this.client.destroy();
        }
        if (this.server) {
            this.server.kill();
            console.log("kill server");
        }
    }

    private pool = [];

    resolve(id: number, data: string) {
        if (!(id in this.pool)) {
            return;
        }
        // console.log(`${id} receive ${data}`);
        this.pool[id].resolve(data);
        delete this.pool[id];
    }

    reject(id: number, err: string) {
        if (!(id in this.pool)) {
            return;
        }
        this.pool[id].reject(err);
        delete this.pool[id];
    }

    read() {
        let buffer: Buffer;
        this.client.on("data", data => {
            if (data.length < 12) {
                buffer = data;
            }
            else {
                if (buffer) {
                    data = Buffer.concat([buffer, data]);
                    buffer = null;
                    this.client.emit("data", data);
                    return;
                }
                if (data.slice(0, 4).toString() !== "mist") {
                    console.error("error");
                    return;
                }
                let id = data.readUInt32LE(4);
                let length = data.readUInt32LE(8);
                if (data.length == 12 + length) {
                    this.resolve(id, data.slice(12).toString());
                }
                else if (data.length < 12 + length) {
                    buffer = data;
                }
                else {
                    this.resolve(id, data.slice(12, 12 + length).toString());
                    this.client.emit("data", data.slice(12 + length));
                }
            }
        });
    }

    /*
        request:
            4 mist
            4 id
            1 op length
            * op
            4 content length
            * content

        response:
            4 mist
            4 id
            4 content length
            * data
    */
    private static id = 0;
    public send(op: string, data: string): Promise<string> {
        return new Promise<string>( (resolve, reject) => {
            if (this.server && this.client) {
                let contentBuffer = Buffer.from(data);
                let buffer = Buffer.allocUnsafe(4 + 4 + 1 + op.length + 4);
                let offset = 0;
                let id = ++MistServer.id;
                offset = buffer.write("mist", offset);
                offset = buffer.writeUInt32LE(id, offset);
                offset = buffer.writeUInt8(op.length, offset);
                offset += buffer.write(op, offset);
                offset = buffer.writeUInt32LE(contentBuffer.length, offset);
                buffer = Buffer.concat([buffer, contentBuffer]);
                this.client.write(buffer);
                this.pool[id] = {resolve: resolve, reject: reject};
                setTimeout(this.reject.bind(this, id, "request timed out"), 2000);

                // console.log(`${id} send ${op} ${data}`);
            }
            else {
                reject("Mist Language Server is not ready");
            }
        } );
    }
}