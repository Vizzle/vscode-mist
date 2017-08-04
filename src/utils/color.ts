
'use strict';

export function cssColor(mistColor: string): string {
    if (typeof mistColor !== "string") {
        mistColor = mistColor["normal"] || "";
    }
    
    if (!mistColor.startsWith('#')) {
        return mistColor;
    }

    if (mistColor.length == 5) {
        let a = Number.parseInt(mistColor.substr(1, 1), 16) / 15.0;
        let r = Number.parseInt(mistColor.substr(2, 1), 16) * 255 / 15;
        let g = Number.parseInt(mistColor.substr(3, 1), 16) * 255 / 15;
        let b = Number.parseInt(mistColor.substr(4, 1), 16) * 255 / 15;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    else if (mistColor.length == 9) {
        let a = Number.parseInt(mistColor.substr(1, 2), 16) / 255.0;
        let r = Number.parseInt(mistColor.substr(3, 2), 16);
        let g = Number.parseInt(mistColor.substr(5, 2), 16);
        let b = Number.parseInt(mistColor.substr(7, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    return mistColor;
}
