import { IDJ } from '../../models/dj.js'
import { ISong } from '../../models/song.js'

type DJ = Pick<IDJ, "events">
type Song = Pick<ISong, "songID" | "title">

let djs: DJ[] = []
let songs: Song[] = []

// Fetch DJs from the server
fetch('/api/djs').then(response => response.json()).then(data => {
    djs = data;
});

// Fetch songs from the server
fetch('/api/songs').then(response => response.json()).then(data => {
    songs = data;
});

const searchElem = document.getElementById('search') as HTMLInputElement
searchElem?.addEventListener('input', function (event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z]/g, '')
    searchAndDisplaySongs(input, 'search-results')
})

function searchAndDisplaySongs(input: HTMLInputElement, elementID: string) {
    const searchTerm: string = input.value.toLowerCase();
    const matchedSongs: Song[] = songs.filter(song => song.title?.toLowerCase().includes(searchTerm));
    displaySongs(matchedSongs, elementID);
}

// redundant function already in manage.ts
function displaySongs(matchedSongs: Song[], elementID: string) {
    const songList = document.getElementById(elementID) as HTMLTableElement
    if (!songList) return
    songList.innerHTML = '' // clear

    matchedSongs.forEach(song => {
        if (song.songID && song.title) {
            const li = document.createElement('li');
            const input = document.createElement('input')
            const label = document.createElement('label')

            input.type = 'checkbox'
            input.id = `song${song.songID}`
            input.name = 'selected-songs'
            input.value = song.songID.toString()

            label.htmlFor = input.id
            label.innerText = song.title

            li.appendChild(input)
            li.appendChild(label)
            songList.appendChild(li)
            }
    })
}

export {}