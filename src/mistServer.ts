import * as fs from 'fs'
import * as http from 'http'
import { compile } from 'mistc'
import * as os from 'os'
import * as path from 'path'
import * as QRCode from 'qrcode'
import * as request from 'request'
import * as vscode from 'vscode'
import { commands, ExtensionContext } from 'vscode'
import { isMistFile } from './previewProvider'

export let stopServerFunc: () => void

enum CommandContext {
  IsDebugging = 'mist:isDebugging'
}

function setCommandContext(key: CommandContext | string, value: any) {
  return commands.executeCommand('setContext', key, value)
}

export function registerMistServer(context: ExtensionContext) {
  registerServer(context)
  registerPushService(context)
}

function registerServer(context: ExtensionContext) {
  let server: http.Server
  let clientAddress: string
  let output: vscode.OutputChannel
  setCommandContext(CommandContext.IsDebugging, false)
  context.subscriptions.push(
    commands.registerCommand('mist.startServer', (uri) => {
      if (server) {
        return
      }
      let workingDir = vscode.workspace.rootPath
      if (!workingDir) {
        vscode.window.showErrorMessage('未打开文件夹')
        return
      }

      let serverPort = 10001
      server = http.createServer(async (req, res) => {
        output.appendLine(`> ${req.method}\t${req.url}`)
        if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' })
          res.end('It works!')
          return
        }

        clientAddress = req.connection.remoteAddress

        const file = path.join(workingDir, req.url)
        try {
          if (!fs.existsSync(file)) {
            throw new Error('file not exists')
          }

          let content: string
          if (path.extname(file) === '.mist') {
            try {
              content = (await compile(file, { platform: 'ios', debug: true })) as string
            } catch (e) {
              output.appendLine(e)
              const name = req.url.replace(/^\//, '')
              vscode.window
                .showErrorMessage(`'${name}' 模板编译失败，请修复错误后重新请求。${e}`, '打开该模板')
                .then(async (r) => {
                  const doc = await vscode.workspace.openTextDocument(file)
                  if (doc) {
                    vscode.window.showTextDocument(doc)
                  }
                })
            }
          } else if (path.extname(file) === '.png') {
            fs.readFile(file, 'binary', function (err, file) {
              if (err) {
                console.log(err)
                return
              } else {
                res.writeHead(200, { 'Content-Type': 'image/png' })
                res.write(file, 'binary')
                res.end()
              }
            })
            return
          } else {
            content = fs.readFileSync(file, 'utf-8')
          }

          res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' })
          res.end(content)
        } catch (e) {
          res.writeHead(404)
          res.end(`'${file}' file not found`)
        }
      })

      server.once('error', (err) => {
        server = null
        let errMsg: string
        if ((err as any).code === 'EADDRINUSE') {
          errMsg = 'Port 10001 already in use. Use <lsof -i tcp:10001> then <kill $PID> to free.'
        } else {
          errMsg = 'Failed to start server. ' + err.message
        }
        vscode.window.showErrorMessage(errMsg)
      })

      server.listen(serverPort, '0.0.0.0', function () {
        setCommandContext(CommandContext.IsDebugging, true)
        const nets = os.networkInterfaces()
        let localAddress = undefined
        if (nets.hasOwnProperty('en0')) {
          for (let index = 0; index < nets.en0.length; index++) {
            const net = nets.en0[index]
            if (net.family === 'IPv4' && !net.internal) {
              localAddress = net.address
              break
            }
          }
        }

        output = vscode.window.createOutputChannel('Mist Debug Server')
        output.show()
        output.appendLine(
          `> Start mist debug server at http://${localAddress ? localAddress : '127.0.0.1'}:${serverPort}`
        )
        if (localAddress) {
          const qrcodePath = '/tmp/mist.png'
          let config = {
            ip: localAddress,
            port: String(serverPort)
          }
          QRCode.toFile(qrcodePath, JSON.stringify(config))
          output.appendLine('> 如果使用设备调试，记得配置调试参数，或者扫码配置。')
          output.appendLine(`> QRCode: file://${qrcodePath}  ← Please hold command and click`)
        } else {
          output.appendLine("Can't find local address")
        }
      })
    })
  )

  context.subscriptions.push(
    commands.registerCommand('mist.stopServer', (uri) => {
      stopServer()
    })
  )

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      let validFormat = isMistFile(document) || document.uri.path.endsWith('.json')
      if (!validFormat) {
        return
      }

      if (!server) {
        return
      }
      let clientPort = 10002
      let options = {
        hostname: clientAddress || '0.0.0.0',
        port: clientPort,
        method: 'GET',
        path: '/refresh'
      }
      const req = http.request(options, null)
      req.on('error', (e) => {
        console.log(`SIMULATOR NOT RESPONSE: ${e.message}\n`)
      })
      req.end()
    })
  )

  function stopServer() {
    if (server) {
      server.close()
      server = null
    }
    if (output) {
      output.clear()
      output.hide()
      output.dispose()
      output = null
    }
    if (vscode.workspace.rootPath) {
      return setCommandContext(CommandContext.IsDebugging, false)
    }
  }
  stopServerFunc = stopServer
}

function registerPushService(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('mist.debugAndroid', (args) => {
      console.info('click debug.Android')
      require('child_process').exec("adb shell ip route | awk '{printf $9}'", async function (error, stdout, stderr) {
        pushTemplateToPhone(stdout, 'android')
      })
    })
  )

  context.subscriptions.push(
    commands.registerCommand('mist.debugIOS', (args) => {
      console.info('click debug.iOS')
      pushTemplateToPhone(null, 'ios')
    })
  )
}

/**
 * 读取某个路径下的所有文件名和目录名，返回Array
 * @param path 目录路径string
 */
function readFiles(path: string) {
  return new Promise<string[]>((resolve) => {
    fs.readdir(path, (err, files) => {
      resolve(files)
    })
  })
}

/**
 * 生成文件名和文件路径对象集合
 * @param dir 父目录路径string
 * @param fileNames 文件名数组
 */
function generatePathArray(dir, fileNames) {
  const fileArray = []
  if (fileNames && fileNames.length > 0) {
    for (const fileName of fileNames) {
      fileArray.push({
        name: fileName,
        path: dir + '/' + fileName
      })
    }
  }
  return fileArray
}

/**
 * 用vscode编辑器打开指定路径的文件
 * @param path 文件路径
 */
async function openEditor(path: string) {
  const exists = fs.existsSync(path)
  let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(`${exists ? 'file://' : 'untitled:'}${path}`))
  vscode.window.showTextDocument(doc)
}

/**
 * 在json文件的第一个节点插入一个value为""的键值对，key为指定值
 * @param path json文件路径
 * @param name key的名称
 */
async function insertInEditor(path: string, name: string) {
  const exists = fs.existsSync(path)
  let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(`${exists ? 'file://' : 'untitled:'}${path}`))
  let editor = await vscode.window.showTextDocument(doc)
  let value = exists ? `"${name}": "$0",` : `{"${name}": "$0"}`
  editor.insertSnippet(new vscode.SnippetString(value), new vscode.Position(0, 1))
}

/**
 * 推送模板到目标端
 * @param deviceIp 目标设备ip地址
 * @param platform 目标设备端口
 */
async function pushTemplateToPhone(deviceIp, platform) {
  let fileUri = vscode.window.activeTextEditor.document.uri
  let mistFile = decodeURI(fileUri.toString().substring(7))
  let mistPath = path.parse(mistFile)
  let configFile = mistPath.dir + '/config.json'

  if (!fs.existsSync(configFile)) {
    fs.closeSync(fs.openSync(configFile, `w`))
    fs.writeFileSync(configFile, '{}')
  }

  let config
  try {
    config = JSON.parse(fs.readFileSync(configFile, 'utf-8'))
  } catch (e) {
    openEditor(configFile)
    vscode.window.showErrorMessage('请确保config.json文件内容格式为JSON。')
    return
  }

  if (!deviceIp) {
    deviceIp = config.deviceIp
  }
  if (!deviceIp) {
    vscode.window.showErrorMessage('未检测到手机IP，请配置手机IP地址。')
    insertInEditor(configFile, 'deviceIp')
    return
  }

  const noBizCode = config.noBizCode
  const bizCode = config.bizCode
  if (!noBizCode && !bizCode) {
    vscode.window.showErrorMessage('请配置业务前缀bizCode，无业务前缀请配置noBizCode: true。')
    insertInEditor(configFile, 'bizCode')
    return
  }

  let templateContent
  try {
    templateContent = await compile(mistFile, { minify: true, platform: platform, debug: true })
  } catch (e) {
    vscode.window.showErrorMessage('模板编译不通过：' + e.message)
    return
  }

  const imagesDir = mistPath.dir + '/Images'
  const images = await readFiles(imagesDir)
  const filePaths = generatePathArray(imagesDir, images)
  const dataPath = generateDataPath(mistPath.dir, config.dataPath)
  filePaths.push({
    name: 'mockData.json',
    path: dataPath
  })

  const templateName = noBizCode ? mistPath.base : config.bizCode + '@' + mistPath.name
  const formData = generateFromData(filePaths, templateName, templateContent)
  const devicePort = config.devicePort ? parseInt(config.devicePort) : 9012
  const deviceUrl = `http://${deviceIp}:${devicePort}/update`
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
      title: 'MIST预览'
    },
    (progress, token) => {
      progress.report({ message: '正在连接手机' })
      const promise = new Promise<void>((resolve) => {
        postForm(deviceUrl, formData, 3000, (err, res, data) => {
          if (err) {
            if (err.code == 'ETIMEDOUT') {
              vscode.window.showErrorMessage(`连接手机超时，请确保IP与端口无误：${deviceIp}:${devicePort}`)
            } else if (err.code == 'ECONNREFUSED') {
              vscode.window.showErrorMessage(`手机拒绝连接，Server挂了，请重启App：${deviceIp}`)
            } else {
              vscode.window.showErrorMessage(`连接手机失败，未知异常：${err}`)
            }
          } else if (data) {
            data = JSON.parse(data)
            if (data.success == true) {
              progress.report({ increment: 100, message: '模板已传输到手机' })
            } else if (data.message) {
              vscode.window.showErrorMessage(`模板传输失败：${data.message}`)
            }
          } else {
            vscode.window.showErrorMessage('模板传输失败: 未知错误!')
          }
          setTimeout(
            () => {
              resolve()
            },
            data && data.success ? 1500 : 0
          )
        })
      })
      token.onCancellationRequested(() => {
        console.log('User canceled the preview mist operation')
      })
      return promise
    }
  )
}

/**
 * 生成数据文件路径
 * @param dir 父目录路径string
 * @param dataPath config.json配置的dataPath
 */
function generateDataPath(dir, dataPath) {
  if (dataPath && dataPath.indexOf('/') != 0) {
    dataPath = path.join(dir, dataPath)
  }
  return dataPath ? dataPath : path.join(dir, './mockData.json')
}

/**
 * 组装表单数据对象
 * @param filePaths 要添加到表单中的文件对象数组
 * @param templateName mist模板名称
 * @param templateContent mist模板内容
 */
function generateFromData(filePaths, templateName, templateContent) {
  const formData = {}
  formData['templateName'] = templateName
  formData['templateHtml'] = templateContent
  if (filePaths && filePaths.length > 0) {
    for (let file of filePaths) {
      if (fs.existsSync(file.path) && fs.lstatSync(file.path).isFile()) {
        formData[file.name] = {
          value: fs.createReadStream(file.path),
          options: {
            filename: file.name
          }
        }
      }
    }
  }
  return formData
}

/**
 * post一个表单到指定url
 * @param url url
 * @param formData 表单对象
 * @param callback 回调函数
 */
function postForm(url, formData, timeout, callback) {
  request.post(
    {
      timeout: timeout,
      url: url,
      headers: { 'Content-Type': 'multipart/form-data' },
      formData: formData
    },
    callback
  )
}
