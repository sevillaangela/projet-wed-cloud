// Décide si un nom et une adresse peuvent identifier un rédacteur.
// La page s'en sert. Le test aussi. Aucun envoi.
export function identiteValide(nom, email) {
  const name = nom.trim()
  const adresse = email.trim().toLowerCase()

  if (name.length === 0 || name.length > 80) {
    return { ok: false, erreur: 'Indique ton nom, en 80 caractères au plus.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresse)) {
    return { ok: false, erreur: 'Cette adresse e-mail n\'est pas valable.' }
  }
  return { ok: true, name, email: adresse }
}
