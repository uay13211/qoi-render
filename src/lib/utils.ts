import {Color, Threshold, ImageData} from "./types";
import getPixels from "get-pixels";

export async function getDataFromPng(pngPath: string): Promise<ImageData> {
    return new Promise(resolve => {
        getPixels(pngPath, (err, pixels) => {
            if (err) {
                throw new Error("Invalid Image");
            }

            resolve({
                width: pixels.shape[0],
                height: pixels.shape[1],
                channels: pixels.shape[2],
                pixels: pixels.data,
            });
        });
    });
}

export function getIndexPosition({r, g, b, a}: Color): number {
    return (r * 3 + g * 5 + b * 7 + a * 11) % 64;
}

export function isSameColor(color1: Color, color2: Color): boolean {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
}

export function getColorDiff(currColor: Color, prevColor: Color): Color {
    return {
        r: currColor.r - prevColor.r,
        g: currColor.g - prevColor.g,
        b: currColor.b - prevColor.b,
        a: currColor.a - prevColor.a,
    };
}

export function isWithinThreshold(value: number, threshold: Threshold) {
    return value >= threshold[0] && value <= threshold[1];
}
