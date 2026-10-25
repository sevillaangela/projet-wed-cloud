import { identiteValide } from './identite.js'

const cle = 'journal-identite'
const formulaire = document.querySelector('#entree')
const message = document.querySelector('#message')
const champNom = formulaire.elements.nom
const champEmail = formulaire.elements.email

function afficher(texte, erreur) {
  message.textContent = texte
  message.classList.toggle('erreur', erreur)
}

function lire() {
  const brut = localStorage.getItem(cle)
  if (!brut) return null
  try {
    return JSON.parse(brut)
  } catch {
    return null
  }
}

const deja = lire()
if (deja) {
  champNom.value = deja.name
  champEmail.value = deja.email
  afficher(`Déjà retenu dans ce navigateur : ${deja.name}, ${deja.email}.`, false)
}

formulaire.addEventListener('submit', (evenement) => {
  evenement.preventDefault()
  const resultat = identiteValide(champNom.value, champEmail.value)
  if (!resultat.ok) {
    afficher(resultat.erreur, true)
    return
  }
  localStorage.setItem(cle, JSON.stringify({ name: resultat.name, email: resultat.email }))
  champNom.value = resultat.name
  champEmail.value = resultat.email
  afficher(`Retenu : ${resultat.name}, ${resultat.email}. Rien n'a été envoyé.`, false)
})

document.querySelector('#effacer').addEventListener('click', () => {
  localStorage.removeItem(cle)
  formulaire.reset()
  afficher('Effacé de ce navigateur.', false)
})
