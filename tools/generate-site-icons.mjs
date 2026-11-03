import { createCanvas, SvgExportFlag } from '@napi-rs/canvas'
import { writeFileSync } from 'node:fs'

// Material You colors and a hiragana mark for the Japanese learning site.
function draw(canvas, size) {
  const ctx = canvas.getContext('2d')
  ctx.scale(size / 256, size / 256)
  ctx.fillStyle = '#eee3f5'
  ctx.beginPath()
  ctx.roundRect(0, 0, 256, 256, 64)
  ctx.fill()
  ctx.fillStyle = '#593c70'
  ctx.font = '600 170px "Yu Gothic"'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('あ', 125, 138)
}

const svg = createCanvas(256, 256, SvgExportFlag.ConvertTextToPaths)
draw(svg, 256)
writeFileSync('docs/public/favicon.svg', svg.getContent())
for (const [size, filename] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
  const canvas = createCanvas(size, size)
  draw(canvas, size)
  const png = canvas.toBuffer('image/png')
  writeFileSync(`docs/public/${filename}`, png)
  if (size === 32) {
    // ICO directory with a PNG payload, supported by current browsers.
    const header = Buffer.alloc(22)
    header.writeUInt16LE(1, 2)
    header.writeUInt16LE(1, 4)
    header[6] = header[7] = 32
    header.writeUInt16LE(1, 10)
    header.writeUInt16LE(32, 12)
    header.writeUInt32LE(png.length, 14)
    header.writeUInt32LE(22, 18)
    writeFileSync('docs/public/favicon.ico', Buffer.concat([header, png]))
  }
}
