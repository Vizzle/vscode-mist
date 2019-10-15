import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode'
import * as httpServer from 'http-server';
import * as request from 'request';

import { isMistFile } from './previewProvider';
import { commands, ExtensionContext } from 'vscode';

export let stopServerFunc: () => void

enum CommandContext {
  IsDebugging = 'mist:isDebugging'
}

function setCommandContext(key: CommandContext | string, value: any) {
  return commands.executeCommand('setContext', key, value);
}

export function registerMistServer(context: ExtensionContext) {
  registerServer(context)
  registerPushService(context)
}

function registerServer(context: ExtensionContext) {
  let server;
  let output;
  setCommandContext(CommandContext.IsDebugging, false);
  context.subscriptions.push(commands.registerCommand('mist.startServer', uri => {
    if (server) {
      return;
    }
    let workingDir = vscode.workspace.rootPath;
    if (!workingDir) {
      vscode.window.showErrorMessage("未打开文件夹");
      return;
    }
    let options = {
      root: workingDir,
      logFn: (req, res, err) => {
        output.appendLine(`> GET\t${req.url}`);
      }
    };
    let serverPort = 10001;
    server = httpServer.createServer(options);
    server.server.once("error", err => {
      server = null;
      let errMsg;
      if (err.code === 'EADDRINUSE') {
        errMsg = "Port 10001 already in use. Use <lsof -i tcp:10001> then <kill $PID> to free.";
      }
      else {
        errMsg = "Failed to start server. " + err.message;
      }
      vscode.window.showErrorMessage(errMsg);
    });
    server.listen(serverPort, "0.0.0.0", function () {
      setCommandContext(CommandContext.IsDebugging, true);
      output = vscode.window.createOutputChannel("Mist Debug Server");
      output.show();
      output.appendLine(`> Start mist debug server at 127.0.0.1:${serverPort}`);
    });
  }));
  context.subscriptions.push(commands.registerCommand('mist.stopServer', uri => {
    stopServer();
  }));

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
    let validFormat = isMistFile(document) || document.uri.path.endsWith('.json');
    if (!validFormat || !server) {
      return;
    }
    let clientPort = 10002;
    let options = {
      hostname: '0.0.0.0',
      port: clientPort,
      method: 'GET',
      path: '/refresh'
    };
    var req = require('http').request(options, null);
    req.on('error', (e) => {
      console.log(`SIMULATOR NOT RESPONSE: ${e.message}\n`);
    });
    req.end();
  }));
  function stopServer() {
    if (server) {
      server.close();
      server = null;
    }
    if (output) {
      output.clear();
      output.hide();
      output.dispose();
      output = null;
    }
    if (vscode.workspace.rootPath) {
      return setCommandContext(CommandContext.IsDebugging, false);
    }
  }
  stopServerFunc = stopServer;
}

function registerPushService(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('mist.debugAndroid', args => {
    // push current file to Android
    require('child_process').exec('adb shell ip route', function (error, stdout, stderr) {
      var ptr = stdout.indexOf("scope link  src ");
      if (ptr <= 0) {
        console.log("failed read ip from adb!");
        vscode.window.showErrorMessage("从adb获取手机IP失败，请使用USB连接手机。");
        return;
      }
      var ptr = ptr + "scope link  src ".length;
      var ip = stdout.substr(ptr).trim();
      console.log("device [" + ip + "]");
      var fileUri = vscode.window.activeTextEditor.document.uri;
      var file = fileUri.toString().substring(7);
      var filePath = path.parse(file);
      var templateName = filePath.name;
      filePath = path.parse(filePath.dir);
      var templateConfigPath = filePath.dir + "/.template_config.json";
      fs.exists(templateConfigPath, async function (tplConfigExist) {
        if (!tplConfigExist) {
          vscode.window.showErrorMessage("配置文件不存在。请填写业务前缀并保存（如：KOUBEI）。");
          let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(`untitled:${templateConfigPath}`));
          let editor = await vscode.window.showTextDocument(doc);
          editor.insertSnippet(new vscode.SnippetString(`{
    "bizCode": "$0"
}`));
          return;
        }
        console.log("current file : " + fileUri + " template_config file : " + templateConfigPath + (tplConfigExist ? "" : " is not exist!"));
        var cfg_content = fs.readFileSync(templateConfigPath, "UTF-8");
        var cfg = JSON.parse(cfg_content);
        console.log("bizCode:" + cfg.bizCode);
        let templateContent;
        try {
          var JsoncParser = require("jsonc-parser");
          var content = JSON.stringify(JsoncParser.parse(vscode.window.activeTextEditor.document.getText(), "", { disallowComments: false, allowTrailingComma: true }));
          console.log("templateContent : " + content);
          templateContent = encodeURIComponent(content);
        }
        catch (e) {
          vscode.window.showErrorMessage("模板格式错误：" + e.message);
          return;
        }
        var content = 'templateName=' + cfg.bizCode + "@" + templateName + "&templateHtml=" + templateContent; // + "// timestamp = " + process.hrtime();
        let headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };
        let url = `http://${ip}:9012/update`;
        request.post({
          url,
          headers,
          form: content
        }, (err, res, data) => {
          console.log(err, res, data);
          if (err) {
            vscode.window.showErrorMessage("传输模板到手机失败：" + err.message);
          }
          else {
            vscode.window.showInformationMessage("模板已传输到手机");
          }
        });
      });
    });
  }));
}
