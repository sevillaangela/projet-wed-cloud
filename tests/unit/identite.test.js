import { describe, expect, it } from 'vitest'
import { identiteValide } from '../../web/js/identite.js'

describe('identité déclarative', () => {
  it('nettoie le nom et met l\'adresse en minuscules', () => {
    const resultat = identiteValide('  Amina Diallo  ', 'Amina@Ecole.FR')
    expect(resultat).toEqual({
      ok: true,
      name: 'Amina Diallo',
      email: 'amina@ecole.fr',
    })
  })

  it('refuse un nom vide', () => {
    expect(identiteValide('   ', 'amina@ecole.fr').ok).toBe(false)
  })

  it('refuse une adresse sans arobase', () => {
    expect(identiteValide('Amina', 'amina.ecole.fr').ok).toBe(false)
  })
})