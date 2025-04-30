import { IDJ } from '../../../models/dj.js'
import { ISong } from '../../../models/song.js'
import { ITimeslot } from '../../../models/timeslot.js'

type DJ = IDJ
type Song = ISong
type Timeslot = ITimeslot

let djs: DJ[] = []
let songs: Song[] = []
let timeslots: Timeslot[] = []

// could switch to axios
fetch('/api/djs')
  .then(response => response.json())
  .then((data: DJ[]) => {
    djs = data
    populateDJs()
  })

// Fetch songs from the server
fetch('/api/songs')
  .then(response => response.json())
  .then((data: Song[]) => {
    songs = data
  })

// Fetch timeslots from the server
fetch('/api/timeslots')
  .then(response => response.json())
  .then((data: Timeslot[]) => {
    timeslots = data
    populateTimeSlots(timeslots)
  })


// Function to populate DJ dropdown
function populateDJs() {
  const djSelect = document.getElementById('dj-select')
  if (!djSelect) return

  djs.forEach(dj => {
    const option = document.createElement('option') as HTMLOptionElement
    option.value = dj.djID?.toString() ?? ""
    option.innerText = dj.name ?? ""
    djSelect.appendChild(option);
  })
}

function populateTimeSlots(timeslots: Timeslot[]) {
  const timeslotSelect: HTMLElement | null = document.getElementById('time-slot')
  if (!timeslotSelect) return
  
  timeslots.forEach(timeslot => {
      const option: HTMLOptionElement = document.createElement('option')
      option.value = timeslot.slot ?? ""
      option.innerText = timeslot.slot ?? ""
      timeslotSelect.appendChild(option)
  });
}

// Search songs
document.getElementById('song-search')?.addEventListener('input', function (event) {
  const djSelect = document.getElementById('dj-select') as HTMLSelectElement
  if (!djSelect) return

  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/[^a-zA-Z]/g, '')
  const searchTerm = input.value.toLowerCase()

  // Filter out songs based on the search term and DJ's song list
  const selectedDJID = parseInt(djSelect.value)
  const dj = djs.find(dj => dj.djID === selectedDJID)
  
  const matchedSongs = songs.filter(song => 
      song.title?.toLowerCase()?.includes(searchTerm) && song.songID && dj?.songs?.includes(song.songID)
  )

  displaySongs(matchedSongs)
});

// Function to display matched songs
function displaySongs(matchedSongs: Song[]) {
  const songList = document.getElementById('song-list')
  const djSelect = document.getElementById('dj-playlist-select') as HTMLSelectElement
  if (!songList || !djSelect) return

  songList.innerHTML = '' // clear

  const selectedDJID = parseInt(djSelect.value)
    const dj = djs.find(dj => dj.djID === selectedDJID)
    // should just console.error here that dj wasn't found
    
    const filteredSongs = matchedSongs.filter(song => song.songID && dj?.songs?.includes(song.songID))

  filteredSongs.forEach(song => {
    const li = document.createElement('li')
    const input = document.createElement('input') as HTMLInputElement
    const label = document.createElement('label')

    input.type = 'checkbox'
    input.id = `song${song.songID}`
    input.name = 'selected-songs'
    input.value = song.title ?? ""

    label.htmlFor = input.id
    label.innerText = song.title ?? ""

    li.appendChild(input)
    li.appendChild(label)
    songList.appendChild(li)
  })
}

function addEventToDJ() {
  const selectedDJID = (document.getElementById('dj-select') as HTMLInputElement)?.value
  const selectedTimeSlot = (document.getElementById('time-slot') as HTMLInputElement)?.value
  const selectedSongElements = document.querySelectorAll('#song-list input[name="selected-songs"]:checked') as NodeListOf<HTMLInputElement>
  const selectedSongs = Array.from(selectedSongElements).map(element => element.value)
  if (!(selectedDJID && selectedTimeSlot && selectedSongElements && selectedSongs)) return

  fetch(`/api/djs/${selectedDJID}/addevent`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          time: selectedTimeSlot,
          songs: selectedSongs
      }),
  })
  .then(response => response.json())
  .then(() => {
    document.getElementById('message')?.replaceChildren('Event successfully created!')
  })
  .catch(error => console.error('Error:', error))
}

document.getElementById('add-event-to-dj-btn')?.addEventListener('click', function() {
  addEventToDJ()
})

document.getElementById('dj-select')?.addEventListener('change', function () {
  // Trigger a search again to filter songs based on the new DJ selection
  const searchElem = document.getElementById('song-search') as HTMLInputElement
  const searchTerm = searchElem.value.toLowerCase()
  const matchedSongs = songs.filter(song => 
      song.title?.toLowerCase()?.includes(searchTerm)
  )
  if (matchedSongs.length > 0) displaySongs(matchedSongs)
})

