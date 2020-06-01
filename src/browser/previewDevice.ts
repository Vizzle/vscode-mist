
export default class Device {
    constructor(
        public model: string,
        public system: 'iOS' | 'Android',
        public width: number,
        public height: number,
        public scale: number,
        public statusBarHeight: number,
        public titleBarHeight: number,
        public roundCorner?: number
    ) {}
}
