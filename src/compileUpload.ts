import { commands, ExtensionContext, window, workspace, Uri, ViewColumn} from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function registerMistTemplate(context: ExtensionContext) {
    registerMistUpload(context)
}

function registerMistUpload(context: ExtensionContext) {
    let workingDir = workspace.rootPath;
    if (!workingDir) {
        console.warn('未打开文件夹，Mist 上传服务未启动')
        return
    }
    const file = path.join(workingDir, 'config.json')
    if (!fs.existsSync(file)) {
        commands.executeCommand('setContext', 'mist:hasConfig', false);
        return;
    }
    let content = fs.readFileSync(file, 'utf-8')
    if (!content) {
        commands.executeCommand('setContext', 'mist:hasConfig', false);
        return;
    }
    commands.executeCommand('setContext', 'mist:hasConfig', true);
    // context.subscriptions.push(commands.registerCommand('mist.compileUploadAll', uri => {
    //     execTemplate(undefined);
    // }));
    context.subscriptions.push(commands.registerCommand('mist.compileUpload', (...args) => {
        let result = new Array();
        for ( const { fsPath } of args[1]) {
            if (fsPath.indexOf('mist') > 0) {
                result.push(fsPath);
            }
        }
        if (result.length == 0) {
            window.showErrorMessage("请选择需要编译的mist文件");
            return;
       }
       let templates = '';
       for (const template of result) {
            templates += `${path.basename(template)},`
       }
       templates = templates.substring(0, templates.length - 1);
       execTemplate(templates);
    }));

}

function execTemplate(tpls) {
    let workingDir = workspace.rootPath;
    const file = path.join(workingDir, 'config.json')
    if (!fs.existsSync(file)) {
        return;
    }
    let content = fs.readFileSync(file, 'utf-8')
    if (!content) {
        return;
    }
    let jsonResult = JSON.parse(content);
    let {templates: tplsArr} = jsonResult;
    let templates;
    if (tpls) {
        templates = tpls;
    } else if (tplsArr && tplsArr.length > 0) {
        templates = '';
        for ( const tpl of tplsArr) {
            templates += `${tpl},`
        }
        templates = templates.substring(0, templates.length - 1);
    } else {
        window.showErrorMessage("请配置templates");
        const options = {
            // 显示在第二个编辑器
            viewColumn: ViewColumn.Two
        }
        window.showTextDocument(Uri.file('config.json'), options)
        return;
    }
    
    let mTml = window.createTerminal("");
    mTml.show(false);
    mTml.sendText(`./Scripts/ziptemplate.sh ${templates}`);
    // const git = simplegit(workspace.rootPath);
    // git.status().then((status) => {
    //     console.log(status);
    //     if (status.modified.length > 0 || status.ahead > 0) {
    //         window.showWarningMessage("当前有未提交代码，请先完成提交再操作", "确定").then(result => {
                
    //         })
    //     } else {
    //         git.pull().then((result) => {
    //             let mTml = window.createTerminal("");
    //             mTml.show(false);
    //             mTml.sendText(`./Scripts/ziptemplate.sh ${templates} ${platform} ${needPreset} ${needCompress} ${clientVersion} ${iosPath} ${androidPath}`);
    //         })
    //     }
    // })
}