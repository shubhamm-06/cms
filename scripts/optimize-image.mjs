import path from "node:path";
import { mkdir, stat } from "node:fs/promises";
import sharp from "sharp";

const [inputArg, outputNameArg, maxWidthArg = "2000"] = process.argv.slice(2);

if (!inputArg || !outputNameArg) {
  console.error("Usage: node scripts/optimize-image.mjs <input> <output-name> [maxWidth=2000]");
  process.exit(1);
}

const maxWidth = Number.parseInt(maxWidthArg, 10);
if (!Number.isInteger(maxWidth) || maxWidth < 1) {
  throw new Error(`maxWidth must be a positive integer; received: ${maxWidthArg}`);
}

const projectRoot = process.cwd();
const inputPath = path.resolve(projectRoot, inputArg);
const outputName = path.basename(outputNameArg, path.extname(outputNameArg));
const outputDirectory = path.join(projectRoot, "public", "images", "corporate");
const outputPath = path.join(outputDirectory, `${outputName}.webp`);

await mkdir(outputDirectory, { recursive: true });

const inputSize = (await stat(inputPath)).size;
const image = sharp(inputPath, { failOn: "error" });
const metadata = await image.metadata();

if (!metadata.width) {
  throw new Error(`Could not read image width from ${inputPath}`);
}

await image
  .resize({ width: maxWidth, withoutEnlargement: true })
  .webp({ quality: 76, effort: 6 })
  .toFile(outputPath);

const outputSize = (await stat(outputPath)).size;
console.log(`Input:  ${inputPath} (${inputSize.toLocaleString()} bytes)`);
console.log(`Output: ${outputPath} (${outputSize.toLocaleString()} bytes)`);
console.log(`Dimensions: ${metadata.width}x${metadata.height ?? "unknown"} → max width ${maxWidth}px`);
