const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, paint) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y += 1) {
    raw[stride * y] = 0;
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = paint(x, y, size);
      const o = stride * y + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function paint(x, y, s) {
  const paprika = [196, 92, 50, 255];
  const cream = [250, 244, 230, 255];
  const r = s * 0.18;
  const inRound =
    (x >= r || y >= r || (r - x) ** 2 + (r - y) ** 2 <= r * r) &&
    (x < s - r || y >= r || (x - (s - r)) ** 2 + (r - y) ** 2 <= r * r) &&
    (x >= r || y < s - r || (r - x) ** 2 + (y - (s - r)) ** 2 <= r * r) &&
    (x < s - r || y < s - r || (x - (s - r)) ** 2 + (y - (s - r)) ** 2 <= r * r);
  if (!inRound) return [0, 0, 0, 0];
  const stem =
    x >= s * 0.3 && x <= s * 0.48 && y >= s * 0.22 && y <= s * 0.78;
  const foot =
    x >= s * 0.3 && x <= s * 0.72 && y >= s * 0.62 && y <= s * 0.78;
  if (stem || foot) return cream;
  return paprika;
}

const dir = path.join(__dirname, "..", "public");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "apple-touch-icon.png"), png(180, paint));
fs.writeFileSync(path.join(dir, "icon-192.png"), png(192, paint));
fs.writeFileSync(path.join(dir, "icon-512.png"), png(512, paint));
console.log("wrote public/apple-touch-icon.png, icon-192.png, icon-512.png");
