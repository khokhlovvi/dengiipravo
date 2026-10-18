// Готовит изображения для сайта: WebP двух размеров и сжатый JPEG как запасной вариант
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../images-src/', import.meta.url));
const dir = fileURLToPath(new URL('../public/images/', import.meta.url));
for (const name of ['hero', 'warehouse']) {
  const file = path.join(src, `${name}.png`);
  await sharp(file).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(dir, `${name}.webp`));
  await sharp(file).resize({ width: 800 }).webp({ quality: 78 }).toFile(path.join(dir, `${name}-800.webp`));
  await sharp(file).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(dir, `${name}.jpg`));
  console.log(name);
}
