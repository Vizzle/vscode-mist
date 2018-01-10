import Device from "./previewDevice";
import { render, postRender } from "./render";
import { bindData } from "./template";
import { ImageInfo } from "./image";

declare const shortcut: any;

const devices: Device[] = [
    new Device('iPhone 4', 'iOS', '10.0.0', 320, 480, 2),
    new Device('iPhone 5', 'iOS', '10.0.0', 320, 568, 2),
    new Device('iPhone 6', 'iOS', '10.0.0', 375, 667, 2),
    new Device('iPhone 6 Plus', 'iOS', '10.0.0', 414, 736, 3),
    new Device('iPad', 'iOS', '10.0.0', 768, 1024, 1),
    new Device('iPad Air', 'iOS', '10.0.0', 768, 1024, 2),
    new Device('iPad Pro 12.9-inch', 'iOS', '10.0.0', 1024, 1366, 2),
];

const scales = [
    { desc: '200%', scale: 2 },
    { desc: '150%', scale: 1.5 },
    { desc: '100%', scale: 1 },
    { desc: '75%', scale: 0.75 },
    { desc: '50%', scale: 0.5 },
    { desc: '33%', scale: 0.33333333333333 },
];

class Dropdown {
    public readonly element: HTMLElement;
    private buttonElement: HTMLElement;
    private nameElement: HTMLElement;
    private listElement: HTMLElement;
    private selectedIndex: number = 0;

    constructor(private title: string, private items: {
        name: string,
        desc?: string,
        callback?: () => void
    }[], private emptyText = '<Empty>') {
        this.element = this.elementFromHtml(
            `<div title="${title}" class="dropdown navi-item" id="device-dropdown">
                <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
                    <span class="dropdown-name"></span>
                    <span class="caret"></span>
                </button>
                <ul class="dropdown-menu" role="menu"></ul>
            </div>`);
        this.buttonElement = <HTMLElement>this.element.getElementsByTagName('button').item(0);
        this.nameElement = <HTMLElement>this.element.getElementsByClassName('dropdown-name').item(0);
        this.listElement = <HTMLElement>this.element.getElementsByTagName('ul').item(0);
        this.updateItems(items);
    }

    public select(index: number) {
        if (index === this.selectedIndex || index >= this.items.length) return;
        this.selectedIndex = index;
        this.listElement.getElementsByClassName('selected').item(0).classList.remove('selected');
        this.listElement.children.item(index).classList.add('selected');
        let item = this.items[index];
        this.nameElement.textContent = item.name;
        if (item.callback) item.callback();
    }

    private elementFromHtml(html: string) {
        let div = document.createElement('div');
        div.innerHTML = html;
        return <HTMLElement>div.firstChild;
    }

    public updateItems(items: {
        name: string,
        desc?: string,
        callback?: () => void
    }[]) {
        this.items = items;
        while (this.listElement.childElementCount > 0) {
            this.listElement.children.item(0).remove();
        }

        if (this.selectedIndex > items.length) {
            this.selectedIndex = 0;
        }

        if (!items || items.length === 0) {
            this.nameElement.textContent = this.emptyText;
            this.buttonElement.classList.add('disabled');
            return;
        }
        
        this.buttonElement.classList.remove('disabled');

        items.forEach((item, i) => {
            let el = this.elementFromHtml(
                `<li role="presentation" class="${i === this.selectedIndex ? 'selected' : ''}">
                    <a role="menuitem" tabindex="-1" style="cursor: pointer">${item.desc || item.name}</a>
                </li>`);
            el.onclick = () => {
                this.listElement.getElementsByClassName('selected').item(0).classList.remove('selected');
                el.classList.add('selected');
                this.nameElement.textContent = item.name;
                if (item.callback) {
                    item.callback();
                }
            }
            if (i === this.selectedIndex) {
                this.nameElement.textContent = item.name;
            }
            this.listElement.appendChild(el);
        });
    }
}

type ClientType = 'vscode' | 'browser-socket' | 'browser';

class Client {
    private path: string;
    private socket: WebSocket;
    private timer;
    private template;
    private datas: { name: string, data: any }[];
    private dataName: string;
    private device: Device;
    private images: ImageInfo[];
    private datasDropdown: Dropdown;
    private devicesDropdown: Dropdown;
    private scalesDropdown: Dropdown;
    private send: (type: string, params?: {}) => void;
    private inspecting: boolean;
    private showFrames: boolean;
    private hoverOverlay: HTMLElement;
    private framesOverlay: HTMLCanvasElement;
    private bindedTemplate;
    private nodeStyleWhileShowingFrames: HTMLStyleElement;

    constructor(
        private type: ClientType,
        private port: number = 0)
    {
        this.hoverOverlay = document.getElementById('mist-hover');
        this.framesOverlay = document.createElement('canvas');
        this.framesOverlay.classList.add('overlay');
        this.nodeStyleWhileShowingFrames = document.createElement('style');
        this.nodeStyleWhileShowingFrames.appendChild(document.createTextNode('.mist-node { pointer-events: none; }'));
        this.prepareButtons();
        this.prepareNaviBar();
        this.prepareSocket();
        this.device = devices[0];
        this.render();
    }

    private prepareButtons() {
        let inspectButton = document.getElementById('inspect-element');
        let framesButton = document.getElementById('show-frames');

        let inspectButtonClicked = () => {
            inspectButton.classList.toggle('toggle');
            this.inspecting = inspectButton.classList.contains('toggle');
            if (this.inspecting && this.showFrames) {
                framesButton.click();
            }
            if (!this.inspecting) {
                this.hoverOverlay.style.opacity = '0';
            }
        };
        if (this.type !== 'vscode') {
            inspectButton.title += '（⌘⇧C）';
            shortcut.add("Meta+Shift+C", inspectButtonClicked);
        }
        inspectButton.onclick = inspectButtonClicked;

        framesButton.onclick = () => {
            framesButton.classList.toggle('toggle');
            this.showFrames = framesButton.classList.contains('toggle');
            this.drawFrames();
            if (this.inspecting && this.showFrames) {
                inspectButton.click();
            }
        }
    }

    private clearFrames() {
        let context = this.framesOverlay.getContext('2d');
        context.clearRect(0, 0, this.framesOverlay.width, this.framesOverlay.height);
    }

    private drawFrames() {
        if (this.showFrames) {
            if (!this.nodeStyleWhileShowingFrames.parentNode)
                document.getElementsByTagName('head')[0].appendChild(this.nodeStyleWhileShowingFrames);
        }
        else {
            if (this.nodeStyleWhileShowingFrames.parentNode)
                this.nodeStyleWhileShowingFrames.remove();
        }

        let scale = window.devicePixelRatio;
        this.framesOverlay.width = this.framesOverlay.clientWidth * scale;
        this.framesOverlay.height = this.framesOverlay.clientHeight * scale;
        let context = this.framesOverlay.getContext('2d');
        context.clearRect(0, 0, this.framesOverlay.width, this.framesOverlay.height);
        if (!this.showFrames) return;

        context.scale(scale, scale);
        context.strokeStyle = 'rgba(112, 168, 218, 0.88)';
        context.fillStyle = 'rgba(112, 168, 218, 0.16)';
        let nodes = document.getElementsByClassName('mist-node');
        let mainRect = nodes.item(0).getBoundingClientRect();
        let drawNode = (node: HTMLElement) => {
            let rect = node.getBoundingClientRect();
            let l = rect.left - mainRect.left,
                t = rect.top - mainRect.top,
                w = rect.width, h = rect.height;
            context.fillRect(l, t, w, h);
            context.strokeRect(l, t, w, h);
        };
        for (var i = 0; i < nodes.length; i++) {
            drawNode(<HTMLElement>nodes.item(i));
        }
    }

    private getData() {
        if (this.datas && this.datas.length > 0) {
            let data = this.datas.find(d => d.name === this.dataName);
            if (!data) {
                data = this.datas[0];
                this.dataName = data.name;
            }
            return data.data;
        }
        return {};
    }

    private updateDatasDropdown() {
        this.datasDropdown.updateItems((this.datas || []).map(d => {
            return {
                name: d.name,
                callback: () => {
                    this.dataName = d.name;
                    this.render();
                }
            }
        }));
    }

    private setErrorDesc(desc) {
        const footer = document.getElementById('footer');
        footer.classList.remove('hidden');
        footer.textContent = desc;
    }
    
    private prepareNaviBar() {
        let naviBar = document.getElementById('navi-bar');
        this.datasDropdown = new Dropdown('选择数据', [], '无数据');
        naviBar.appendChild(this.datasDropdown.element);

        this.devicesDropdown = new Dropdown('选择设备', devices.map(d => {
            return {
                name: d.model,
                desc: `${d.model} (${d.width} x ${d.height})`,
                callback: () => {
                    this.device = d;
                    this.render();
                }
            }
        }));
        naviBar.appendChild(this.devicesDropdown.element);

        this.scalesDropdown = new Dropdown('缩放', scales.map(s => {
            return {
                name: s.desc, 
                callback: () => (<HTMLElement>document.getElementsByClassName('screen')[0]).style.transform=`scale(${s.scale})`
            };
        }));
        this.scalesDropdown.select(2);
        naviBar.appendChild(this.scalesDropdown.element);
    }

    private prepareSocket() {
        if (this.type !== 'browser') {
            this.socket = new WebSocket(`ws://localhost:${this.port}`);
            this.socket.addEventListener("open", () => {
                this.send('open');
            });
            let error = false;
            this.socket.addEventListener("error", event => {
                error = true;
                this.socket = null;
                this.setErrorDesc('与宿主连接失败');
            });
            this.socket.addEventListener("close", event => {
                this.socket = null;
                if (!error) this.setErrorDesc('与宿主连接已断开');
            });
            this.socket.addEventListener("message", event => {
                let data = JSON.parse(event.data);
                this.onMessage(data);
            });
            this.send = (type, params = {}) => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({ type, ...params }));
                }
            }
        }
        else {
            window.addEventListener('mist-client', (ev: CustomEvent) => {
                this.onMessage(ev.detail);
            });
            this.send = (type, params = {}) => {
                let event = new CustomEvent('mist-server', { detail: {type, ...params} });
                window.dispatchEvent(event);
            }
        }
    }

    onMessage(data: any) {
        switch (data.type) {
            case 'select':
                let indexes = data.indexes ? data.indexes.join(',') : null;
                this.selectNode(indexes);
                break;
            case 'data':
                this.path = data.path;
                this.template = data.template;
                this.images = data.images.map(i => new ImageInfo(i.name, i.files));
                this.datas = data.datas;
                this.updateDatasDropdown();
                this.render();
                break;
        }
    }

    private selectNode(indexes: string) {
        var allNodes = document.getElementsByClassName('mist-node');
        var selectedNodes: HTMLElement[] = [];
        for (var i = 0; i < allNodes.length; i++) {
            let node: HTMLElement = <HTMLElement>allNodes.item(i);
            if (node.dataset.nodeIndex === indexes) {
                selectedNodes.push(node);
            }
        }
        var selects = document.getElementById('mist-selects');
        if (selectedNodes.length > 0) {
            let nodes = [];
            while (selectedNodes.length > selects.childElementCount) {
                var select: HTMLElement = document.createElement('div');
                select.classList.add('mist-select');
                selects.appendChild(select);
            }
            for (var i = selectedNodes.length; i < selects.childElementCount; i++) {
                var select = <HTMLElement>selects.children.item(i);
                select.style.opacity = "0";
            }
            if (!this.timer) {
                for (var i = 0; i < selectedNodes.length; i++) {
                    var select = <HTMLElement>selects.children.item(i);
                    select.classList.remove('select-anim');
                    select.style.opacity = "0";
                    select.style.transform = "scale(1.2)";
                }
            }
            else {
                for (var i = 0; i < selectedNodes.length; i++) {
                    var select = <HTMLElement>selects.children.item(i);
                    select.style.opacity = "1";
                }
            }
            for (var i = 0; i < selectedNodes.length; i++) {
                var select = <HTMLElement>selects.children.item(i);
                var node = selectedNodes[i];
                var nodeRect = node.getBoundingClientRect();
                select.style.width = nodeRect.width + 'px';
                select.style.height = nodeRect.height + 'px';
                select.style.left = nodeRect.left + 'px';
                select.style.top = nodeRect.top + 'px';
            }
            if (!this.timer) {
                setTimeout(() => {
                    for (var i = 0; i < selectedNodes.length; i++) {
                        var select = <HTMLElement>selects.children.item(i);
                        select.style.opacity = "1";
                        select.classList.add('select-anim');
                        select.style.transform = "scale(1)";
                    }
                }, 0);
            }
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.timer = setTimeout(() => {
                for (var i = 0; i < selectedNodes.length; i++) {
                    var select = <HTMLElement>selects.children.item(i);
                    select.style.opacity = "0";
                }
                this.timer = null;
            }, 500);
        }
        else {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            for (var i = 0; i < selects.childElementCount; i++) {
                let child = <HTMLElement>selects.children.item(i);
                child.style.opacity = "0";
            }
        }
    }

    private getBuiltinVars() {
        let isX = this.device.width === 812;
        return {
            _width_: this.device.width,
            _height_: this.device.height,
            _mistitem_: {},
            system: {
                name: this.device.system,
                version: this.device.version,
                deviceName: this.device.model
            },
            screen: {
                width: this.device.width,
                height: this.device.height,
                scale: this.device.scale,
                statusBarHeight: isX ? 44 : 20,
                isPlus: this.device.width > 400,
                isSmall: this.device.width < 350,
                isX: isX,
                safeArea: isX ? { top: 44, left: 0, bottom: 34, right: 0 } : {},
            },
            app: {},

            UIScreen: { mainScreen: { scale: this.device.scale } }
        }
    }

    private resolveImageFiles(layout): string[] {
        var files = [];
        let imageName = (value) => {
            let image = ImageInfo.findImage(this.images, value, this.device.scale);
            let ret = '';
            if (image) {
                if (this.type === 'browser-socket') ret += 'getImage/';
                ret += image.file;
                if (image.scale !== this.device.scale) {
                    ret += '?' + image.scale;
                }
            }
            return ret;
        }
        let _resolveImageFiles = (layout, files: string[]) => {
            function convert(propertyName) {
                var value = layout.style[propertyName];
                if (value) {
                    if (typeof(value) === 'string') {
                        layout.style[propertyName] = imageName(value);
                        files.push(layout.style[propertyName]);
                    }
                    else if (typeof(value) === 'object' && value.constructor === Object) {
                        for (var key in value) {
                            value[key] = imageName(value[key]);
                            files.push(value[key]);
                        }
                    }
                }
            }
            if (layout.style) {
                convert('image');
                convert('error-image');
                convert('background-image');
                if ("html-text" in layout.style) {
                    layout.style["html-text"] = layout.style["html-text"].replace(/src\s*=\s*['"](.*?)['"]/, (s, src) => {
                        let image = ImageInfo.findImage(this.images, src, this.device.scale);
                        files.push(image.file);
                        return image ? `srcset="${image.file} ${image.scale}x"` : '';
                    });
                }
            }
            if (layout.children instanceof Array) {
                for (let child of layout.children) {
                    _resolveImageFiles(child, files);
                }
            }
        }
        _resolveImageFiles(layout, files);
        return files;
    }

    private nodeClicked(node: HTMLElement) {
        this.inspecting = false;
        let inspectButton = document.getElementById('inspect-element');
        inspectButton.classList.remove('toggle');
        this.hoverOverlay.style.opacity = '0';
        this.send('select', {
            path: this.path,
            index: node.dataset.nodeIndex
        });
    }

    private nodeHovering(node: HTMLElement) {
        let hover = this.hoverOverlay;
        if (node) {
            var nodeRect = node.getBoundingClientRect();
            hover.style.opacity = "1";
            hover.style.width = nodeRect.width + 'px';
            hover.style.height = nodeRect.height + 'px';
            hover.style.left = nodeRect.left + 'px';
            hover.style.top = nodeRect.top + 'px';
        }
        else {
            hover.style.opacity = "0";
        }
    }

    private render() {
        let div = document.getElementsByClassName('mist-main')[0];
        while (div.children.length > 0)
            div.children.item(0).remove();
        this.bindedTemplate = bindData(this.template, this.getData(), this.getBuiltinVars());
        let imageFiles = this.resolveImageFiles(this.bindedTemplate.layout);
        return render(this.bindedTemplate.layout, this.device.width, this.device.scale, imageFiles).then(r => {
            r.onmouseleave = event => {
                this.nodeHovering(null);
            };
    
            function getMistNode(event) {
                var node = event.target;
                while (!node.classList.contains('mist-node')) {
                    node = node.parentElement;
                }
                return node;
            }
        
            r.onmousemove = event => {
                if (!this.inspecting) return;
                var node = getMistNode(event);
                this.nodeHovering(node);
            };
    
            r.onmousedown = event => {
                if (!this.inspecting) return;
                var node = getMistNode(event);
                this.nodeClicked(node);
            };

            r.oncontextmenu = event => {
                var node = getMistNode(event);
                var overlay = document.createElement('div');
                overlay.style.position = "absolute";
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.bottom = '0';
                overlay.style.right = '0';
                overlay.style.zIndex = '10000';
                overlay.onmousedown = event => {
                    if (menu.contains(<Node>event.target)) return;
                    overlay.remove();
                };
                var menu = document.createElement('div');
                menu.classList.add('dropdown-menu');
                menu.style.left = "unset";
                menu.style.display = "block";
                overlay.appendChild(menu);
                var inspectItem = document.createElement('div');
                inspectItem.classList.add('context-item');
                inspectItem.textContent = '检查元素';
                inspectItem.style.padding = "3px 20px";
                inspectItem.style.cursor = "pointer";
                inspectItem.onclick = event => {
                    overlay.remove();
                    this.nodeClicked(node);
                };
                menu.appendChild(inspectItem);

                menu.style.position = "absolute";
                document.body.appendChild(overlay);
                if (event.x + menu.clientWidth > document.body.clientWidth) {
                    menu.style.right = document.body.clientWidth - event.x + 'px';
                    menu.style.left = event.x - menu.clientWidth + 'px';
                }
                else {
                    menu.style.left = event.x + 'px';
                }
                if (event.y + menu.clientHeight > document.body.clientHeight) {
                    menu.style.bottom = document.body.clientHeight - event.y + 'px';
                    menu.style.top = event.y - menu.clientHeight + 'px';
                }
                else {
                    menu.style.top = event.y + 'px';
                }
                
                return false;
            }

            div.appendChild(r);
            div.appendChild(this.framesOverlay);
            this.framesOverlay.style.minWidth = this.framesOverlay.style.width = div.clientWidth + 'px';
            this.framesOverlay.style.minHeight = this.framesOverlay.style.height = r.clientHeight + r.clientTop + 'px';
            postRender(r);
            this.drawFrames();
            this.updateScreen();
        });
    }
    
    updateScreen() {
        let screen = <HTMLElement>document.getElementsByClassName('screen').item(0);
        screen.classList.remove('hidden');
        screen.style.minWidth = this.device.width + 'px';
        screen.style.height = this.device.height + 'px';
    }

}

var client;

export default function main() {
    let type = document.body.dataset.type;
    let port = parseInt(document.body.dataset.port);
    client = new Client(type as ClientType, port);
}

document.addEventListener('DOMContentLoaded', main);