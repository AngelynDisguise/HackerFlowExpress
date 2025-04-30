document.addEventListener("DOMContentLoaded", function () {
    const logoImage = document.querySelector(".logo") as HTMLImageElement
    const volumeCheckbox = document.getElementById("volume-on") as HTMLInputElement
    const audio = document.getElementById("logo-audio") as HTMLAudioElement
    if (!(logoImage && volumeCheckbox && audio)) return
  
    audio.muted = true
    volumeCheckbox.checked = false
  
    function playAudio() {
      if (volumeCheckbox.checked) {
        audio.muted = false // unmute when the checkbox is checked
        audio.play()
      }
    }
  
    function stopAudio() {
      audio.pause()
      audio.currentTime = 0
    }
  
    logoImage.addEventListener("mouseenter", playAudio)
    logoImage.addEventListener("mouseleave", stopAudio)
  
    volumeCheckbox.addEventListener("change", function () {
      if (!volumeCheckbox.checked) {
        stopAudio()
      } 
    //   else {
    //     playAudio() // if checkbox is checked, play audio with volume
    //   }
    })
  })
  