
export default class Device {
    constructor(
        public model: string,
        public system: 'iOS' | 'Android',
        public version: string,
        public width: number,
        public height: number,
        public scale: number) {}
}
