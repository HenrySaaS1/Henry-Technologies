/**
 * henry-logo.png is used as PNG but may be JPEG bytes or a PNG/JPEG with a white or black matte.
 * Rewrites true RGBA PNGs with near-white and near-pure-black pixels set transparent (logo colors preserved).
 */
import { createRequire } from 'module'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const Jimp = require('jimp')

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const targets = [join(root, 'src', 'assets', 'henry-logo.png'), join(root, 'public', 'henry-logo.png')]

const WHITE = 248
const BLACK = 10

function knock(img) {
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (_x, _y, idx) {
    const r = this.bitmap.data[idx]
    const g = this.bitmap.data[idx + 1]
    const b = this.bitmap.data[idx + 2]
    if (r >= WHITE && g >= WHITE && b >= WHITE) {
      this.bitmap.data[idx + 3] = 0
      return
    }
    if (r <= BLACK && g <= BLACK && b <= BLACK) {
      this.bitmap.data[idx + 3] = 0
    }
  })
}

for (const file of targets) {
  const img = await Jimp.read(file)
  knock(img)
  await img.writeAsync(file)
  console.log('Wrote transparent PNG:', file)
}
