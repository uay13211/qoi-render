import {Color, QOIImageData} from "./types";
import {
    END_MARK,
    QOIF_MAGIC_BYTE,
    QOI_HEADER_SIZE,
    QOI_END_MARK_SIZE,
    RUN_THRESHOLD,
    RUN_TAG,
    RUN_BIAS,
    DIFF_THRESHOLD,
    DIFF_TAG,
    DIFF_BIAS,
    LUMA_DG_THRESHOLD,
    LUMA_DRDG_DBDG_THRESHOLD,
    LUMA_TAG,
    LUMA_DG_BIAS,
    LUMA_DRDG_DBDG_BIAS,
    RGB_TAG,
    RGBA_TAG,
    INDEX_TAG,
    TAG_CHUNK_MASK,
    RUN_LENGTH_CHUNK_MASK,
    INDEX_CHUNK_MASK,
    DIFF_DB_CHUNK_MASK,
    DIFF_DG_CHUNK_MASK,
    DIFF_DR_CHUNK_MASK,
    LUMA_DBDG_CHUNK_MASK,
    LUMA_DG_CHUNK_MASK,
    LUMA_DRDG_CHUNK_MASK,
} from "./constants";
import {isSameColor, getIndexPosition, getColorDiff, isWithinThreshold} from "./utils";

export const encode = (buffer: Uint8Array, width: number, height: number, channels: number, colorSpace: number): Uint8Array => {
    let RUN = 0;
    let index = 0;

    const lastPixel = buffer.byteLength - channels;
    let prevPixel: Color = {r: 0, g: 0, b: 0, a: 255};
    const seenPixels: Array<Color> = Array.from({length: 64}, () => ({r: 0, g: 0, b: 0, a: 0}));
    // 5 for worst case: full rgba for each pixels
    const maxSize = height * width * 5 + QOI_END_MARK_SIZE + QOI_HEADER_SIZE;
    const bytes = new Uint8Array(maxSize);

    function write32(value: number) {
        bytes[index++] = (0xff000000 & value) >> 24;
        bytes[index++] = (0x00ff0000 & value) >> 16;
        bytes[index++] = (0x0000ff00 & value) >> 8;
        bytes[index++] = (0x000000ff & value) >> 0;
    }

    // write header
    write32(QOIF_MAGIC_BYTE);
    write32(width);
    write32(height);
    bytes[index++] = channels;
    bytes[index++] = colorSpace;

    // loop through image buffer
    for (let i = 0; i <= lastPixel; i += 4) {
        const currPixel: Color = {r: buffer[i], g: buffer[i + 1], b: buffer[i + 2], a: channels === 3 ? prevPixel.a : buffer[i + 3]};
        const indexPosition = getIndexPosition(currPixel);

        if (isSameColor(currPixel, prevPixel)) {
            // same as previous pixel
            RUN++;

            if (!isWithinThreshold(RUN, RUN_THRESHOLD) || i === lastPixel) {
                // if RUN touch the threshold or the last pixel
                bytes[index++] = RUN_TAG | (RUN + RUN_BIAS);
                // reset RUN
                RUN = 0;
            }
        } else {
            // when repeated pixel ends
            if (RUN > 0) {
                // if RUN touch the threshold or the last pixel
                bytes[index++] = RUN_TAG | (RUN + RUN_BIAS);
                // reset RUN
                RUN = 0;
            }

            // seen pixel
            if (isSameColor(seenPixels[indexPosition], currPixel)) {
                bytes[index++] = INDEX_TAG | indexPosition;
            } else {
                // store current pixel in seen pixels
                seenPixels[indexPosition] = {...currPixel};

                // pixel diff
                const colorDiff: Color = getColorDiff(currPixel, prevPixel);
                // for luma
                const dr_dg = colorDiff.r - colorDiff.g;
                const db_dg = colorDiff.b - colorDiff.g;

                // only store diff or luma if alpha same as previous pixel
                if (colorDiff.a === 0) {
                    // if dr, dg, db within threshold, store diff
                    if (isWithinThreshold(colorDiff.r, DIFF_THRESHOLD) && isWithinThreshold(colorDiff.g, DIFF_THRESHOLD) && isWithinThreshold(colorDiff.b, DIFF_THRESHOLD)) {
                        bytes[index++] = DIFF_TAG | ((colorDiff.r + DIFF_BIAS) << 4) | ((colorDiff.g + DIFF_BIAS) << 2) | (colorDiff.b + DIFF_BIAS);
                    }

                    // if within the threshold of luma
                    else if (isWithinThreshold(colorDiff.g, LUMA_DG_THRESHOLD) && isWithinThreshold(dr_dg, LUMA_DRDG_DBDG_THRESHOLD) && isWithinThreshold(db_dg, LUMA_DRDG_DBDG_THRESHOLD)) {
                        bytes[index++] = LUMA_TAG | (colorDiff.g + LUMA_DG_BIAS);
                        bytes[index++] = ((dr_dg + LUMA_DRDG_DBDG_BIAS) << 4) | (db_dg + LUMA_DRDG_DBDG_BIAS);
                    }

                    // store the full rgb value (same alpha)
                    else {
                        bytes[index++] = RGB_TAG;
                        bytes[index++] = currPixel.r;
                        bytes[index++] = currPixel.g;
                        bytes[index++] = currPixel.b;
                    }
                } else {
                    // store the full rgba value
                    bytes[index++] = RGBA_TAG;
                    bytes[index++] = currPixel.r;
                    bytes[index++] = currPixel.g;
                    bytes[index++] = currPixel.b;
                    bytes[index++] = currPixel.a;
                }
            }
        }

        // store current pixel to previous pixel
        prevPixel = {...currPixel};
    }

    // write the end mark
    END_MARK.forEach(byte => {
        bytes[index++] = byte;
    });

    return bytes.slice(0, index);
};

export const decode = (buffer: Uint8Array): QOIImageData => {
    let readIndex = 0;
    let writeIndex = 0;
    const invalidError = new Error("Invalid QOI file");
    const byteLength = buffer.byteLength;
    let prevPixel: Color = {r: 0, g: 0, b: 0, a: 255};
    const seenPixels: Array<Color> = Array.from({length: 64}, () => ({r: 0, g: 0, b: 0, a: 0}));
    const readByte = () => buffer[readIndex++];
    const read32 = () => (readByte() << 24) | (readByte() << 16) | (readByte() << 8) | (readByte() << 0);

    // check if the size valid
    if (byteLength < QOI_HEADER_SIZE + QOI_END_MARK_SIZE) {
        throw invalidError;
    }

    // read header
    if (read32() !== QOIF_MAGIC_BYTE) {
        throw invalidError;
    }
    const width = read32();
    const height = read32();
    const channels = readByte();
    const colorSpace = readByte();
    const pixelsBufferSize = width * height * 4;
    const pixelsBuffer = new Uint8Array(pixelsBufferSize);

    const writePixelsBuffer = (color: Color) => {
        pixelsBuffer[writeIndex++] = color.r;
        pixelsBuffer[writeIndex++] = color.g;
        pixelsBuffer[writeIndex++] = color.b;
        pixelsBuffer[writeIndex++] = color.a;
    };

    const insertPixelIntoSeenPixels = (color: Color) => {
        const indexPosition = getIndexPosition(color);
        seenPixels[indexPosition] = {...color};
    };

    // loop through pixels data
    while (readIndex < byteLength - QOI_END_MARK_SIZE) {
        const byte = readByte();

        if (byte === RGB_TAG) {
            const r = readByte();
            const g = readByte();
            const b = readByte();
            prevPixel = {r, g, b, a: prevPixel.a};
            writePixelsBuffer(prevPixel);
        } else if (byte === RGBA_TAG) {
            const r = readByte();
            const g = readByte();
            const b = readByte();
            const a = readByte();
            prevPixel = {r, g, b, a};
            writePixelsBuffer(prevPixel);
        } else {
            // tag in first 2 bits
            const tag = TAG_CHUNK_MASK & byte;

            switch (tag) {
                case RUN_TAG:
                    const run = (RUN_LENGTH_CHUNK_MASK & byte) - RUN_BIAS;
                    for (let i = 0; i < run; i++) {
                        writePixelsBuffer(prevPixel);
                    }
                    break;
                case INDEX_TAG:
                    const index = INDEX_CHUNK_MASK & byte;
                    const color = seenPixels[index];
                    prevPixel = {...color};
                    writePixelsBuffer(prevPixel);
                    break;
                case DIFF_TAG:
                    const diff_dr = ((DIFF_DR_CHUNK_MASK & byte) >> 4) - DIFF_BIAS;
                    const diff_dg = ((DIFF_DG_CHUNK_MASK & byte) >> 2) - DIFF_BIAS;
                    const diff_db = (DIFF_DB_CHUNK_MASK & byte) - DIFF_BIAS;
                    prevPixel.r = prevPixel.r + diff_dr;
                    prevPixel.g = prevPixel.g + diff_dg;
                    prevPixel.b = prevPixel.b + diff_db;
                    writePixelsBuffer(prevPixel);
                    break;
                case LUMA_TAG:
                    const nextByte = readByte();
                    const luma_dg = (LUMA_DG_CHUNK_MASK & byte) - LUMA_DG_BIAS;
                    const dr_dg = ((LUMA_DRDG_CHUNK_MASK & nextByte) >> 4) - LUMA_DRDG_DBDG_BIAS;
                    const db_dg = (LUMA_DBDG_CHUNK_MASK & nextByte) - LUMA_DRDG_DBDG_BIAS;
                    prevPixel.g = prevPixel.g + luma_dg;
                    prevPixel.r = dr_dg + luma_dg + prevPixel.r;
                    prevPixel.b = db_dg + luma_dg + prevPixel.b;
                    writePixelsBuffer(prevPixel);
                    break;
                default:
                    throw invalidError;
            }
        }

        insertPixelIntoSeenPixels(prevPixel);
    }

    return {
        width,
        height,
        channels,
        colorSpace,
        pixels: pixelsBuffer,
    };
};
