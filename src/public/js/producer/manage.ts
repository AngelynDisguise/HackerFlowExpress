import { DJ as D, Event as E } from '../../../models/dj.js'
import { Song as S } from '../../../models/song.js'

type Event = Omit<E, "eventID">
type DJ = Omit<D, "events"> & { events: Event[] } 
type Song = Pick<S, "songID" | "title">

let djs: DJ[] = []
let songs: Song[] = [];
let events: Event[] = [];

// Fetch DJs from the server
fetch('/api/djs').then(response => response.json()).then((data: DJ[]) => {
    djs = data
    populateDJDropdown();
});

// Fetch songs from the server
fetch('/api/songs').then(response => response.json()).then(data => {
    songs = data;
});

// Fetch events from the server
fetch('/api/events').then(response => response.json()).then(data => {
    events = data;
    populateEventDropdown();
});

function populateDJDropdown() {
    const djSelect = document.getElementById('dj-playlist-select')
    if (!djSelect) return

    djs.forEach(dj => {
        const option = document.createElement('option') as HTMLOptionElement
        option.value = dj.djID?.toString() ?? ""
        option.innerText = dj.name ?? ""
        djSelect.appendChild(option)
    });
}

function populateEventDropdown() {
    const eventSelect = document.getElementById('event-select')
    if (!eventSelect) return

    events.forEach(event => {
        const option = document.createElement('option')
        option.value = event.eventID?.toString() ?? ""
        option.innerText = (event.dj && event.time) ? `${event.dj} (${event.time})` : ""
        eventSelect.appendChild(option)
    });
}

function displayDJEvents(dj: DJ) {
    const djEventsList = document.getElementById('dj-events-list')
    if (!djEventsList) return

    djEventsList.innerHTML = '' // clear

    if (!dj.events || dj.events.length === 0) {
        const li = document.createElement('li')
        li.innerText = 'No events scheduled'
        djEventsList.appendChild(li)
        return
    }

    dj.events.forEach(event => {
        const li = document.createElement('li')

        const djName = document.createElement('p')
        djName.innerText = `DJ: ${event.dj}`
        li.appendChild(djName)

        const timeSlot = document.createElement('p')
        timeSlot.innerText = `TIME: ${event.time}`
        li.appendChild(timeSlot)

        const songList = document.createElement('p')
        songList.innerText = `SONGS: ${event.songs.join(', ')}`
        li.appendChild(songList)

        djEventsList.appendChild(li)
    })
}

document.getElementById('dj-playlist-select')?.addEventListener('change', function() {
    const selectedDJID: string = (this as HTMLInputElement).value
    const dj: DJ | undefined = djs.find(dj => dj.djID === parseInt(selectedDJID)) 
    if (dj) {
        displayDJSongs(dj)
        displayDJEvents(dj)
    }
});

document.getElementById('add-song-btn')?.addEventListener('click', function () {
    const selectedSongs = document.querySelectorAll('#add-dj-song-list input[name="selected-songs"]:checked') as NodeListOf<HTMLInputElement>
    const selectedDJID = document.getElementById('dj-playlist-select') as HTMLInputElement
    // todo: fix types
    selectedSongs.forEach(input => {
        addSongToDJ(input.value, selectedDJID.value)
    })
})

document.getElementById('add-song-to-dj')?.addEventListener('input', function (event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z]/g, '')
    searchAndDisplaySongs(input, 'add-dj-song-list')
});

function searchAndDisplaySongs(input: HTMLInputElement, elementID: string) {
    const searchTerm = input.value.toLowerCase()
    const matchedSongs = songs.filter(song => song.title?.toLowerCase().includes(searchTerm));
    displaySongs(matchedSongs, elementID)
}

// redundant: already in search.ts
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

function displayDJSongs(dj: DJ) {
    const djSongsList = document.getElementById('dj-songs-list')
    const djID = dj.djID

    if (!djSongsList || !djID) return

    djSongsList.innerHTML = '' // clear

    if(dj.songs.length === 0) {
        const li = document.createElement('li')
        li.innerText = 'No songs in playlist'
        djSongsList.appendChild(li)
        return
    }

    dj.songs.forEach(songID => {
        const song: Song | undefined = songs.find(s => s.songID === songID)
        if (song) {
            const li = document.createElement('li')
            const deleteButton = document.createElement('button')
            deleteButton.innerText = 'Delete'
            deleteButton.className = 'delete-song-btn'
            deleteButton.onclick = function() {
                deleteSongFromDJ(songID.toString(), djID.toString())
            }
            li.innerText = song.title ?? ""
            li.appendChild(deleteButton)
            djSongsList.appendChild(li)
        }
    });
}

function addSongToDJ(songID: string, djID: string) {
    fetch(`/api/djs/${djID}/addsong`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songID }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayDJSongs(data.updatedDJ)
        } else {
            console.error('Error adding song:', data.message)
        }
    })
    .catch(error => console.error('Error:', error))
}

function deleteSongFromDJ(songID: string, djID: string) {
    fetch(`/api/djs/${djID}/deletesong`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songID }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayDJSongs(data.updatedDJ)
        } else {
            console.error('Error deleting song:', data.message)
        }
    })
    .catch(error => console.error('Error:', error))
}

export {}
