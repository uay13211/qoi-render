import {getDataFromPng} from "../lib/utils";
import fs from "fs";
import path from "path";

const genBinFromImage = async () => {
    const imagePath = path.join(__dirname, "../assets/sample.png");
    const outputPath = path.join(__dirname, "../assets/sample.bin");
    const {pixels} = await getDataFromPng(imagePath);

    // write file
    fs.writeFileSync(outputPath, pixels);
};

genBinFromImage();
