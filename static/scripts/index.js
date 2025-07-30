import requests from './requests.js'
import sidebar from './sidebar.js'

$(async () => {
  const notes = await requests.fetchNotes(false)
  sidebar.showNotes(notes)
  
  sidebar.initSearchBar()
  initEasterEgg()
})

function initEasterEgg() {
  const $el = $('.legal-disclaimer')
  let clicks = []

  $el.on('click', () => {
    console.log(clicks.length)
    const now = Date.now()
    clicks.push(now)

    if (clicks.length > 3) clicks.shift()

    if (clicks.length === 3 && (clicks[2] - clicks[0]) <= 1500) {
      window.open('https://www.magazineluiza.com.br', '_blank')
      clicks = []
    }
  })
}