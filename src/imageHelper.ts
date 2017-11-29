import * as json from 'jsonc-parser'
import * as vscode from 'vscode'
import { MistDocument } from './mistDocument';
import * as fs from 'fs';
import * as path from 'path';

function findXcodeProjectPath(dir: string) {
    while (dir.length > 1) {
        let files = fs.readdirSync(dir);
        files = files.filter(f => f.endsWith('.xcodeproj'));
        if (files.length > 0) {
            return dir + '/' + files[0];
        }
        dir = path.dirname(dir);
    }
    return null;
}

function readXcodeProjSection(section: string, content: string) {
    let re = new RegExp(`/\\* Begin ${section} section \\*/(.|\\n)*?/\\* End ${section} section \\*/`, "m");
    let match = re.exec(content);
    if (match) {
        return match[0];
    }
    return null;
}

function getGroups(content: string) {
    const re = /(\w+)(?: \/\* (.+) \*\/)? = \{\n((?:.|\n)*?)};/mg;
    let match;
    re.lastIndex = 0;
    let groups = [];
    while (match = re.exec(content)) {
        let id = match[1];
        let name = match[2];
        let str: string = match[3];
        let property = p => {
            let match = str.match(new RegExp(`${p} = ((?:.|\\n)*?);`));
            if (match) {
                return match[1];
            }
            return null;
        }
        let path = property('path');
        let childrenStr = property('children');
        if (path && path.startsWith('"')) {
            path = path.substr(1, path.length - 2);
        }
        else if (!path) {
            path = name;
        }
        let children = [];
        if (childrenStr) {
            let re = /^\s*([0-9a-fA-F]{24})/mg;
            let match;
            while (match = re.exec(childrenStr)) {
                children.push(match[1]);
            }
        }
        let group = {
            id: id,
            path: path,
            children: children
        };
        groups.push(group);
    }
    return groups;
}

class ImageInfo {
    name: string;
    file: string;
    at: string[];
}

function getImageFiles(dir: string): ImageInfo[] {
    let xcodeproj = findXcodeProjectPath(dir);
    if (!xcodeproj) {
        return [];
    }
    dir = path.dirname(xcodeproj);
    let pbxprojPath = xcodeproj + '/project.pbxproj';
    let pbxproj = fs.readFileSync(pbxprojPath).toString();
    // let resourcesSection = readXcodeProjSection('PBXResourcesBuildPhase', pbxproj);
    let groupSection = readXcodeProjSection('PBXGroup', pbxproj);
    let groups = getGroups(groupSection);
    let pathForId = id => {
        let group;
        let path = "";
        while(true) {
            group = groups.find(g => g.children.indexOf(id) >= 0);
            if (group && group.path) {
                path = group.path + '/' + path;
                id = group.id;
            }
            else {
                break;
            }
        }
        return path;
    };
    let re = /\w+ \/\* (.*?) in Resources \*\/.* fileRef = (\w+)/mg;
    let match;
    var resources = []
    const resourcesExts = ['.xcassets', '.bundle'];
    while (match = re.exec(pbxproj)) {
        let file: string = match[1];
        let id = match[2];
        if (resourcesExts.indexOf(path.extname(file)) >= 0) {
            resources.push({file: file, id: id});
        }
    }
    resources = resources.map(r => dir + '/' + pathForId(r.id) + r.file);
    let images: ImageInfo[] = [];
    let readAssetsDir = dir => {
        let files = fs.readdirSync(dir);
        files.forEach(f => {
            let file = dir + '/' + f;
            if (f.endsWith('.imageset')) {
                let info: ImageInfo = {
                    file: file,
                    name: f.replace(/\.[^/.]+$/, ''),
                    at: null
                }
                images.push(info);
            }
            else if (fs.statSync(file).isDirectory()) {
                readAssetsDir(file);
            }
        });
    }
    let readBundle = dir => {
        let files = fs.readdirSync(dir);
        files.forEach(f => {
            let file = dir + '/' + f;
            let ext = path.extname(f);
            if (ext === '.png') {
                const re = /^(.*?)(?:@(.*))?\.png$/;
                let match = f.match(re);
                if (match) {
                    let name = path.basename(dir) + '/' + match[1];
                    let info = images.find(info => info.name === name);
                    if (!info) {
                        info = {
                            file: file,
                            name: name,
                            at: []
                        };
                        images.push(info);
                    }
                    info.at.push(match[2]);
                }
            }
            else if (ext === '.gif' || ext === '.jpg' || ext === '.jpeg') {
                let info: ImageInfo = {
                    file: file,
                    name: path.basename(dir) + '/' + f,
                    at: null
                }
                images.push(info);
            }
        });
    }
    resources.map(r => {
        if (r.endsWith('.xcassets')) {
            readAssetsDir(r);
        }
        else if (r.endsWith('.bundle')) {
            readBundle(r);
        }
    });
    return images;
}

export class ImageHelper {
    public static provideCompletionItems(document: MistDocument, token: vscode.CancellationToken) {
        let dir = document.dir();
        if (!dir) {
            return [];
        }
        let images = getImageFiles​​(dir);
        return images.map(info => {
            let item = new vscode.CompletionItem(info.name, vscode.CompletionItemKind.File);
            item.detail = info.name;
            if (info.at) {
                item.documentation = info.at.map(a => `${info.name}@${a}.png`).join('\n');
            }
            return item;
        });
    }
}
