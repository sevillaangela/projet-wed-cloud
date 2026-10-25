import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb } from 'pdf-lib'

const racine = join(dirname(fileURLToPath(import.meta.url)), '../..')

// Phrase qui échoue avec une police PDF standard : œ, € et accents.
const phrase = 'À l\'école, l\'été, le cœur coûte 10 €.'

const resultatPdf = join(
  racine,
  'tests/results/2026-10-25-etape-1-pdf-accents.pdf',
)

describe('PDF français', () => {
  it('dessine les accents avec une police intégrée', async () => {
    const octetsPolice = await readFile(join(racine, 'assets/fonts/DejaVuSans.ttf'))

    const document = await PDFDocument.create()
    document.registerFontkit(fontkit)
    // subset : n'embarque que les glyphes utilisés. Le nom DejaVuSans reste lisible.
    const police = await document.embedFont(octetsPolice, { subset: true })

    for (const caractere of ['À', 'é', 'œ', '€']) {
      expect(police.widthOfTextAtSize(caractere, 12)).toBeGreaterThan(0)
    }
    expect(police.name).toContain('DejaVuSans')

    const page = document.addPage([595.28, 841.89])
    page.drawText(phrase, {
      x: 48,
      y: 780,
      size: 16,
      font: police,
      color: rgb(0, 0, 0),
    })

    document.setTitle('Vérification des accents')
    document.setCreationDate(new Date('2026-10-25T16:32:00Z'))
    document.setModificationDate(new Date('2026-10-25T16:32:00Z'))

    const octets = await document.save()
    const brut = Buffer.from(octets).toString('latin1')
    const lisible = decompresser(brut)

    expect(brut.startsWith('%PDF-')).toBe(true)
    // FontFile2 : le fichier de police est dans le PDF, pas seulement nommé.
    expect(lisible).toContain('DejaVuSans')
    expect(lisible).toContain('/FontFile2')
    expect(extraireTexte(lisible)).toBe(phrase)

    await mkdir(dirname(resultatPdf), { recursive: true })
    await writeFile(resultatPdf, octets)
  })
})

// pdf-lib compresse les objets, parfois sur deux niveaux.
function decompresser(brut, profondeur = 0) {
  const parties = [brut]
  if (profondeur > 3) return parties.join('\n')
  const motif = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  for (const trouve of brut.matchAll(motif)) {
    try {
      const ouvert = inflateSync(Buffer.from(trouve[1], 'latin1')).toString('latin1')
      parties.push(decompresser(ouvert, profondeur + 1))
    } catch {
      // Certains flux ne sont pas compressés.
    }
  }
  return parties.join('\n')
}

// La table ToUnicode relie l'identifiant de glyphe au caractère.
function extraireTexte(lisible) {
  const table = lisible.match(/beginbfchar([\s\S]*?)endbfchar/)
  if (!table) return ''
  const correspondances = new Map()
  for (const trouve of table[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
    correspondances.set(
      trouve[1].toLowerCase(),
      String.fromCharCode(Number.parseInt(trouve[2], 16)),
    )
  }

  const morceaux = []
  for (const trouve of lisible.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) {
    let mot = ''
    for (let i = 0; i < trouve[1].length; i += 4) {
      mot += correspondances.get(trouve[1].slice(i, i + 4).toLowerCase()) ?? ''
    }
    morceaux.push(mot)
  }
  return morceaux.join('')
}
