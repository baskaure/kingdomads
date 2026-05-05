import sharp from 'sharp';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const inputDir = resolve(root, 'input');
const outDir = resolve(root, 'input', 'optim');
mkdirSync(outDir, { recursive: true });

/* yOffset = 0 → crop tout en haut (garde la tête)
   yOffset = 0.5 → crop centré
   yOffset = 1 → crop tout en bas */
const photos = [
  { src: 'satiana.jpeg', yOffset: 0.5 },
  { src: 'aurel.jpg',    yOffset: 0.5 },
  { src: 'ket.jpeg',     yOffset: 0.5 },
  { src: 'will.jpeg',    yOffset: 0.2 },  /* William : tête tout en haut */
  { src: 'Alex.jpeg',    yOffset: 0.05 }, /* Alexandre : tête presque en haut */
];

const sizes = [300, 600];

for (const p of photos) {
  const srcPath = resolve(inputDir, p.src);
  const stem = basename(p.src, extname(p.src));
  const inputBuf = readFileSync(srcPath);
  const inputSize = statSync(srcPath).size;
  console.log(`\n${p.src}  (${(inputSize / 1024).toFixed(1)} KiB) — yOffset=${p.yOffset}`);

  /* crop carré manuel avec offset vertical contrôlé */
  const meta = await sharp(inputBuf).metadata();
  const side = Math.min(meta.width, meta.height);
  const left = Math.round((meta.width - side) / 2);
  const top  = Math.round((meta.height - side) * p.yOffset);
  const squareBuf = await sharp(inputBuf)
    .extract({ left, top, width: side, height: side })
    .toBuffer();

  for (const w of sizes) {
    const webpOut = resolve(outDir, `${stem}-${w}.webp`);
    const jpgOut  = resolve(outDir, `${stem}-${w}.jpg`);
    await sharp(squareBuf)
      .resize({ width: w, height: w })
      .webp({ quality: 78, effort: 5 })
      .toFile(webpOut);
    await sharp(squareBuf)
      .resize({ width: w, height: w })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(jpgOut);
    const wsz = statSync(webpOut).size;
    const jsz = statSync(jpgOut).size;
    console.log(`  → ${stem}-${w}.webp ${(wsz / 1024).toFixed(1)} KiB | ${stem}-${w}.jpg ${(jsz / 1024).toFixed(1)} KiB`);
  }
}

console.log('\nDone.');
