import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'data', 'budget.json')

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/budget', (req, res) => {
  try {
    res.json(JSON.parse(readFileSync(DATA_FILE, 'utf8')))
  } catch {
    res.status(500).json({ error: 'Impossible de lire budget.json' })
  }
})

app.post('/api/budget', (req, res) => {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2))
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Impossible d\'écrire budget.json' })
  }
})

app.listen(3456, () => console.log('✓ Budget API prête sur http://localhost:3456'))
