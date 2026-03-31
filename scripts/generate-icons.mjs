/**
 * Generates minimal placeholder PNG icons for PWA.
 * Dark background (#0a0a0a) with white "AA" text.
 * Uses Node.js built-in capabilities only — no canvas required.
 *
 * A minimal valid PNG is: PNG signature + IHDR chunk + IDAT chunk + IEND chunk.
 * This script generates solid-color PNGs using raw PNG encoding.
 */

import { createWriteStream } from "fs";
import { deflateSync } from "zlib";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

function crc32(buf) {
  let crc = 0xffffffff;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuffer, data, crcBuf]);
}

function generateSolidPNG(size, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width, height, bit depth=8, color type=2 (RGB), compression=0, filter=0, interlace=0
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Image data: each row has a filter byte (0) + RGB pixels
  const rowSize = 1 + size * 3; // 1 filter byte + 3 bytes per pixel
  const raw = Buffer.alloc(size * rowSize);
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0; // filter type: None
    for (let x = 0; x < size; x++) {
      const offset = rowStart + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const compressed = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Dark background: #0a0a0a = rgb(10, 10, 10)
const icons = [
  { size: 192, filename: "icon-192x192.png" },
  { size: 512, filename: "icon-512x512.png" },
];

for (const { size, filename } of icons) {
  const png = generateSolidPNG(size, 10, 10, 10);
  const path = `${publicDir}/${filename}`;
  const ws = createWriteStream(path);
  ws.write(png);
  ws.end();
  console.log(`Generated ${path} (${size}x${size}, ${png.length} bytes)`);
}
