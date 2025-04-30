import { IDJ } from '../../models/dj'
import { ISong } from '../../models/song'

type DJ = Pick<IDJ, "name" | "songs">
type Song = Pick<ISong, "songID" | "title" | "genre">

interface UserPreferences { // already in login.js
    genre: {
        electronic: boolean
        lofi: boolean
        ambient: boolean
        classical: boolean
    }
    DJ: string
}

/** Global variables (ugh) */
let djs: DJ[] = []
let songs: Song[] = []

// Init listener page
document.addEventListener('DOMContentLoaded', () => {
    djs = window.listenerApp.initialData.djs
    songs = filterAvailableSongs(djs, window.listenerApp.initialData.songs)

    initWebSocket() // connect to socket.io
    initEventListeners()

    const username = getCookie('username')
    username ? window.reloadListener(username) : window.login()
})

function initWebSocket() {
    const socket = io()
    socket.on('databaseUpdate', async () => {
        try {
            console.log("Database change detected. Updating...")
            const res1 = await axios.get('http://localhost:3000/api/djs')
            const res2 = await axios.get('http://localhost:3000/api/songs')
            djs = res1.data as Array<DJ>
            songs = filterAvailableSongs(djs, res2.data as Array<Song>)

            updateTableData(djs, songs)

            applyCurrentFilters()
        } catch (error: unknown) {
            console.error('Error reloading data:', error)
        }
    })
}

// Note: could make this more efficient by new mongodb query
function filterAvailableSongs(djs: DJ[], songs: Song[]) {
    const djsWithSongs: DJ[] = djs.filter(dj => dj.songs.length > 0)
    // // One of the DJs has a song
    // return songs.filter(song => djsWithSongs.some(dj => dj.songs.some(s => s === song.songID)))
    // return Array.from(new Set(djsWithSongs.map(dj => dj.songs).flat()))

    // Songs objects from list of available songIDs
    const availableSongIDs = new Set(djs.flatMap(dj => dj.songs))
    return songs.filter(song => song.songID != null && availableSongIDs.has(song.songID))
}

function initEventListeners() {
    const buttons: NodeListOf<Element> =  document.querySelectorAll("[class^='genre-button']")
    buttons.forEach((button, index) => {
        (button as HTMLElement).addEventListener("click", handleGenreButtonClick)
    })

    // DJ Selector
    const djSelector = document.getElementById("DJ")
    if (djSelector) djSelector.addEventListener("change", handleDJSelectorChange)

    // Change name button
    const changeNameButton = document.querySelector(".change-name")
    if (changeNameButton) changeNameButton.addEventListener("click", handleChangeNameClick)
}

// Search song form
function validateForm(event: Event) {
    event.preventDefault() // prevent page refresh
    const inputField = document.getElementById("search-song") as HTMLInputElement
    const errorMessage = document.getElementById("error-message")

    if (!inputField || !errorMessage) return false

    const input = inputField.value.trim()
    if (input === "") {
        errorMessage.textContent = "Please enter a song name."
        errorMessage.style.color = "red"
        return false; // Prevent form submission
    }
    errorMessage.textContent = ""
    filterBySearch(input)
    return true; // Allow form submission
}

function handleGenreButtonClick(event: Event) {
    const button = event.currentTarget as HTMLElement

    const preferencesStr: string | null = localStorage.getItem("preferences")
    if (!preferencesStr) return

    const preferences: UserPreferences = JSON.parse(preferencesStr)
    const index = parseInt(button.className.replace('genre-button', '')) - 1 // e.g. extracts 1 from 'genre-button1'

    // Toggle button color
    if (button.style.backgroundColor === "grey") {
        button.style.backgroundColor = "#1a1a1a"

        // Turn off
        switch (index) {
            case 0: preferences.genre.electronic = false; break
            case 1: preferences.genre.lofi = false; break
            case 2: preferences.genre.ambient = false; break
            case 3: preferences.genre.classical = false; break
        }   
    } else {
        // Turn on
        button.style.backgroundColor = "grey"

        switch (index) {
            case 0: preferences.genre.electronic = true; break
            case 1: preferences.genre.lofi = true; break
            case 2: preferences.genre.ambient = true; break
            case 3: preferences.genre.classical = true; break
        }   
    }

    // Save and display
    localStorage.setItem("preferences", JSON.stringify(preferences))
    applyCurrentFilters()

    console.log("Selected Genre Preferences: ", preferences.genre)
}

function handleDJSelectorChange(event: Event) {
    const selected = event.currentTarget as HTMLSelectElement
    const preferencesStr = localStorage.getItem("preferences")
    if (!preferencesStr) return

    const preferences: UserPreferences = JSON.parse(preferencesStr)
    preferences.DJ = selected.value

    localStorage.setItem("preferences", JSON.stringify(preferences))
    console.log("Selected DJ Preference: ", preferences.DJ)

    filterByDJ(preferences.DJ)
}

function handleChangeNameClick(event: Event) {
    let newUsername: string | null
    do {
        newUsername = prompt("Please enter your new name:")
        if (newUsername === null) return
    } while (newUsername !== null && newUsername.trim() === "")

    document.cookie = `username=${encodeURIComponent(newUsername as string)}; SameSite=Lax`

    const nameElement = document.getElementById("listener-name")
    if (nameElement) nameElement.innerHTML = `Hello ${newUsername}!`
}

function applyCurrentFilters() {
    const preferencesStr: string | null = localStorage.getItem("preferences")
    if (!preferencesStr) return

    const preferences: UserPreferences = JSON.parse(preferencesStr)

    let filteredSongs: Song[] = []

    // apply current genre filter
    if (preferences.genre.electronic || preferences.genre.lofi ||
        preferences.genre.ambient || preferences.genre.classical) {

        const genres: string[] = Object.keys(preferences.genre) // of type UserPreferencs.genre
        type Genre = keyof UserPreferences["genre"]
        
        filteredSongs = songs.filter( (song: Song) => {
                return genres.some(genre => {
                    console.log(`Song '${song.title}' matches genre '${genre}': `, preferences.genre[genre as Genre] && song.genre && song.genre[genre as Genre])
                    return preferences.genre[genre as Genre] && // user selected this genre
                    song.genre && song.genre[genre as Genre] // genre matches current song (and song has genres)
                }) 
        })
        
        if(filteredSongs.length != 0){
            console.log("Matched songs: ", filteredSongs.map(song => ({"title": song.title, "genres": song.genre})))
        } else {
            console.log("No songs exist with selected preferences.")
        }
    } else {
        filteredSongs = [...songs] // if no preferences were selected, all are displayed by default
        console.log("User has no genre preferences, displaying all songs by default.")
    }

    updateTableData(djs, filteredSongs)
    filterByDJ(preferences.DJ)

    const inputField = document.getElementById("search-song") as HTMLInputElement
    if (inputField) {
        const input = inputField.value.trim()
        if (input !== "") {
            filterBySearch(input)
        }
    }
}

function filterBySearch(song: string) {
    console.log(`Searching for song: ${song}`)
    song = song.toUpperCase()
    
    const table = document.getElementById("song-table")
    if (!table) return
    
    const tr = table.getElementsByTagName("tr")

    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName("td")[1]
        if (td) {
            const txtValue = td.textContent || td.innerText
            if (txtValue.toUpperCase().indexOf(song) > -1) {
                tr[i].style.display = ""
            } else {
                tr[i].style.display = "none"
            }
        }
    }
}

function filterByDJ(DJ: string) {
    const djRows = document.querySelectorAll(".dj-row") as NodeListOf<HTMLElement>

    djRows.forEach(row => {
        const djName = (row.classList[1] || "").substring(3)
        row.style.display = (DJ === "AllDJ" || DJ === djName) ? "table-row" : "none"
    })
}

function updateTableData(djs_data: DJ[], songs_data: Song[]) {
    const table = document.getElementById('songs-table') as HTMLTableElement
    if (!table) return

    table.innerHTML = ''

    // Add header row with styles
    table.innerHTML = `
        <tr style="background-color: gray;">
            <th style="width: 35%;">DJ</th>
            <th style="width: 65%;">Songs</th>
        </tr>
    `

    // Iterate through DJs and songs to update the table
    djs_data.forEach((dj) => {
        const djSongs = songs_data.filter(song => song.songID && dj.songs.includes(song.songID))

        djSongs.forEach((song) => {
            const row = table.insertRow()

            row.innerHTML = `
                <td>
                    <img width="25" height="25" src="https://img.icons8.com/ultraviolet/40/test-account.png" alt="test-account" style="padding-right: 10px;" />
                    ${dj.name}
                </td>
                <td>${song.title}</td>
            `

            row.classList.add(`dj-row`, `dj-${dj.name}`)
        })
    })

    //console.log('Table updated with new data:', djs_data, songs_data);
}

function clearSearch() {
    // Clear search field
    const searchInput = document.getElementById("search-song") as HTMLInputElement
    if (searchInput) {
        searchInput.value = ""
    }

    const errorMessage = document.getElementById("error-message")
    if (errorMessage) {
        errorMessage.textContent = ""
    }

    /* Clear preferences */
    const preferencesStr = localStorage.getItem("preferences")
    if (!preferencesStr) return  // this should exist

    const preferences: UserPreferences = JSON.parse(preferencesStr)
    Object.keys(preferences.genre).forEach(genre => {
        preferences.genre[genre as keyof typeof preferences.genre] = false
    })

    // Reset button colors
    const buttons = document.querySelectorAll("[class^='genre-button']") as NodeListOf<HTMLElement>
    buttons.forEach(button => {
        button.style.backgroundColor = "#1a1a1a"
    })

    // Reset DJ selector
    preferences.DJ = "AllDJ"
    const djSelector = document.getElementById("DJ") as HTMLSelectElement
    if (djSelector) {
        djSelector.selectedIndex = 0
    }

    const clearedPreferences: string = JSON.stringify(preferences)
    localStorage.setItem("preferences", clearedPreferences)
    updateTableData(djs, songs)

    console.log("Cleared preferences: ", clearedPreferences)
}

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift()
        return cookieValue ? decodeURIComponent(cookieValue) : null
    }
    return null
}

window.validateForm = validateForm
window.clearSearch = clearSearch
window.applyCurrentFilters = applyCurrentFilters

export {}

