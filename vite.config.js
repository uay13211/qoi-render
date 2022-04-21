import path from "path";

/**
 * @type {import('vite').UserConfig}
 */
const config = {
    root: path.join(__dirname, "src"),
    build: {
        outDir: path.join(__dirname, "dist"),
        emptyOutDir: true,
    },
};

export default config;
