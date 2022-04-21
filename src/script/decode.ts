import fs from "fs";
import path from "path";
import {decode} from "../lib";

const runDecode = async () => {
    const qoiPath = path.join(__dirname, "../assets/encoded.qoi");
    const outputPath = path.join(__dirname, "../assets/decoded.bin");
    const file = fs.readFileSync(qoiPath);
    const buffer = new Uint8Array(file.buffer);

    const {pixels} = decode(buffer);
    // write file
    fs.writeFileSync(outputPath, pixels);
};

runDecode();
