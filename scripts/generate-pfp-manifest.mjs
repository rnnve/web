import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDirectory = path.join(projectRoot, "public", "pfp");
const outputDirectory = path.join(projectRoot, "app", "generated");
const outputFile = path.join(outputDirectory, "pfp-images.ts");
const imagePattern = /\.(?:avif|gif|jpe?g|png|webp)$/i;

let images = [];
try {
  images = (await readdir(sourceDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && imagePattern.test(entry.name))
    .map((entry) => `/pfp/${encodeURIComponent(entry.name)}`)
    .sort();
} catch {
  // An empty folder is valid and falls back to the letter avatar.
}

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFile, `export const profileImages = ${JSON.stringify(images, null, 2)} as const;\n`);
console.log(`Generated profile image manifest with ${images.length} image(s).`);
