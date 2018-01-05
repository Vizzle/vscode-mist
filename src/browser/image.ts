
export type ImageFile = {
    scale: number,
    file: string
};

export class ImageInfo {
    name: string;
    files: { [scale: number]: string };

    constructor(name: string, files: { [scale: number]: string }) {
        this.name = name;
        this.files = files;
    }

    getFile(scale: number): ImageFile {
        scale = Math.round(scale);
        if (scale in this.files) {
            return {
                scale: scale,
                file: this.files[scale]
            };
        }
        
        let scales = Object.keys(this.files);
        if (scales.length > 0) {
            let scale = parseInt(scales[scales.length - 1]);
            return {
                scale: scale,
                file: this.files[scale]
            };
        }
        return null;
    }

    public static findImage(images: ImageInfo[], name: string, scale: number): ImageFile {
        let match = name.match(/@(\d)x\.\w+$/);
        if (match) {
            name = name.replace(/@(\d)x/, '');
            scale = parseInt(match[1]);
        }
        let image = images.find(i => i.name === name);
        if (image) {
            let file = image.getFile(scale);
            if (file) {
                if (match && file.scale !== scale) return null;
                return file;
            }
        }
        
        return null;
    }
}
