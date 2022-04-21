import fs from "fs";
import path from "path";
import {getDataFromPng} from "../lib/utils";
import {encode} from "../lib";

const runEncode = async () => {
    const pngPath = path.join(__dirname, "../assets/test/testcard_rgba.png");
    const outputPath = path.join(__dirname, "../assets/encoded.qoi");
    const {height, width, channels, pixels} = await getDataFromPng(pngPath);
    const bytes = encode(pixels, width, height, channels, 1);

    // write file
    fs.writeFileSync(outputPath, bytes);
};

runEncode();
