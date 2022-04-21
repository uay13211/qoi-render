export type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export type Threshold = [min: number, max: number];

export type ImageData = {
    width: number;
    height: number;
    channels: number;
    pixels: Uint8Array;
};

export interface QOIImageData extends ImageData {
    colorSpace: number;
}
