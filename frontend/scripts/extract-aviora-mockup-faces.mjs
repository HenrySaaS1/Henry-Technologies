/**
 * One-off: crop lead avatars from stakeholder mockup (1024×576).
 * Run: node scripts/extract-aviora-mockup-faces.mjs
 */
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'src/assets/uploads/aviora-reference-dashboard.png')
const W = 1024
const H = 576
const col = (W - 48) / 3
const baseX = 30
/** Status pills sit above the circular lead photo; crop the face circle, not the pill. */
const top = Math.round(H * 0.198)
const size = 84

const crops = [
  { name: 'aviora-lead-olivia-carter', colIndex: 0 },
  { name: 'aviora-lead-ethan-brooks', colIndex: 1 },
  { name: 'aviora-lead-maya-singh', colIndex: 2 },
]

for (const { name, colIndex } of crops) {
  const left = Math.round(baseX + colIndex * col)
  const out = join(root, `src/assets/uploads/${name}.jpg`)
  await sharp(src)
    .extract({ left, top, width: size, height: size })
    .resize(256, 256, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(out)
  console.log('wrote', out, { left, top, size })
}
