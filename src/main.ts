import {decode} from "./lib";
import {QOIImageData} from "./lib/types";

const canvas = document.getElementById("render-image") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const qoiFileInput = document.getElementById("upload-qoi") as HTMLInputElement;
// const binFileInput = document.getElementById("upload-bin") as HTMLInputElement;

const drawQOI = (qoi: QOIImageData) => {
    canvas.width = qoi.width;
    canvas.height = qoi.height;
    if (ctx) {
        const imageData = ctx.createImageData(qoi.width, qoi.height);
        imageData.data.set(qoi.pixels);
        ctx.putImageData(imageData, 0, 0);
    }
};

// const drawBIN = (buffer: Uint8Array, width: number, height: number) => {
//     canvas.width = width;
//     canvas.height = height;
//     if (ctx) {
//         const imageData = ctx.createImageData(width, height);
//         imageData.data.set(buffer);
//         ctx.putImageData(imageData, 0, 0);
//     }
// };

qoiFileInput.addEventListener("change", () => {
    const reader = new FileReader();
    const readerEventHandler = (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
            if (typeof event.target.result === "string") {
                throw new Error("Invalid QOI file");
            }
            const buffer = new Uint8Array(event.target.result);
            const decodedResult = decode(buffer);
            drawQOI(decodedResult);
            reader.removeEventListener("load", readerEventHandler);
        }
    };

    reader.addEventListener("load", readerEventHandler);
    qoiFileInput.files?.[0] && reader.readAsArrayBuffer(qoiFileInput.files?.[0]);
});

// binFileInput.addEventListener("change", () => {
//     const reader = new FileReader();
//     const readerEventHandler = (event: ProgressEvent<FileReader>) => {
//         if (event.target && event.target.result) {
//             if (typeof event.target.result === "string") {
//                 throw new Error("Invalid BIN file");
//             }
//             const buffer = new Uint8Array(event.target.result);
//             drawBIN(buffer, 512, 768);
//             reader.removeEventListener("load", readerEventHandler);
//         }
//     };

//     reader.addEventListener("load", readerEventHandler);
//     binFileInput.files?.[0] && reader.readAsArrayBuffer(binFileInput.files?.[0]);
// });
