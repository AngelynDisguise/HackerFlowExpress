import { IDJ } from '../../models/dj.js'
import { ITimeslot } from '../../models/timeslot.js'

type DJ = Pick<IDJ, "events">
type Timeslot = ITimeslot

let djs: DJ[]
let timeslots: Timeslot[]

// nick's code, could switch to axios
fetch('/api/djs')
    .then(response => response.json())
    .then((data: DJ[]) => {
        djs = data
    })

fetch('/api/timeslots')
    .then(response => response.json())
    .then((data: Timeslot[]) => {
        timeslots = data
        populateTimeSlots(timeslots)
    })

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

function displaySongs(selectedTime: string, elementID: string) {
    const songList = document.getElementById(elementID) as HTMLTableElement
    if (!songList) return

    songList.innerHTML = ''

    djs.forEach(dj => {
        dj.events?.forEach(event =>{
            if(event.time == selectedTime){
                const song = event.songs
                if (song.length != 0) {
                    const tr = document.createElement('tr')

                    const djName = document.createElement('th')
                    djName.innerText = `${event.dj}`
                    tr.appendChild(djName)
        
                    const sList = document.createElement('th')
                    sList.innerText = `${event.songs.join(', ')}`
                    tr.appendChild(sList)

                    songList.appendChild(tr);
                }
            }
        })
    })

    if (songList.childNodes.length == 0) {
        const tr = document.createElement('tr')
        const th = document.createElement('th')
        const h4 = document.createElement('h4')
        h4.innerText = 'No events scheduled for this time'
        th.appendChild(h4)
        tr.appendChild(th)
        songList.appendChild(tr)
        return;
    }
}

(function initEventListeners() {
    const timeslotElem = document.getElementById('time-slot') as HTMLSelectElement
    if (!timeslotElem) return

    timeslotElem.addEventListener('change', function() {
        const selectedTime = this.value
        //const matchedEvents = djs.events.filter(djs.events.timeslot == selectedTime)
        displaySongs(selectedTime, 'dj-songs');
    })
})()