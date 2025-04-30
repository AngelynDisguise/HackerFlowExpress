/* Page onload:
Checks cookies and local storage. Reloads the page state if user is logged in. */
window.onload = function() {
    const cookies: string[] = document.cookie.split("; ")
    const ls: string| null = localStorage.getItem("preferences")

    console.log("(Window Onload) Cookies: ", cookies)
    console.log("(Window Onload) Local Storage: ", ls)

    // look for username
    for (const cookie of cookies) {
        const [name, value] = cookie.split("=")
        console.log("Cookie split: ", cookie.split("="))
        
        if (name === "username") {
            const username = decodeURIComponent(value)
            console.log("(Window Onload) ", username +" already logged in")

            // Reload page state
            reloadListener(username)
            return
        }
    }
    login() // couldn't find a username
}

/* Login:
- Authentication information like username and password are stored in JWT (JSON Web Tokens), 
and are temporarily stored in a httpOnly cookie. This is safe and encypted.
- User Preferences are saved as an object in local storage and persists until the user logs out. T
hey are modifiable by the user. */
// Mock example of authentication without password, using a prompt (no login page yet)
function login() {
    let username: string | null

    do {
        username = prompt("Please enter your username:")
        if (username == null) { // return to homepage if cancelled
            window.location.href = "/"
        }
    } while (username === null || username.trim() === "")
    console.log(username + " tried to logged in...")

    // Username and password sent to server for verification...

    if (username) {
        console.log(username +" logged in successfully")
        document.cookie = `username=${encodeURIComponent(username)}; SameSite=Lax` // Save encrypted user session in cookie

        welcomeListener(username); // Listener login
    } else {
        console.log("Login Failed!") // Login failure handler or redirection to login page to be implemented?
    }
}

/* Logout: clear listener data from cookies and local storage*/
function logout() {
    console.log("Logging out")
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=../pages/listerner.html; SameSite=Lax;";  
    localStorage.removeItem("preferences")
    //window.location.href = "../index.html"
}

/****** LISTENER CODE ******/

interface UserPreferences {
    genre: {
        electronic: boolean
        lofi: boolean
        ambient: boolean
        classical: boolean
    }
    DJ: string
}

const defaultPreferences: UserPreferences = {
    "genre": {
        "electronic": false,
        "lofi": false,
        "ambient": false,
        "classical": false
    },
    "DJ": "AllDJ"
}

function displayWelcomeUser(username: string) {
    const text = `Hello ${username}!`
    const name = document.getElementById("listener-name")
    if (name) {
        name.innerHTML = text
    }
}

function welcomeListener(username: string) {
    const userPreferencesJSON = JSON.stringify(defaultPreferences)

    // Init preferences in local storage
    localStorage.setItem("preferences", userPreferencesJSON)
    console.log("Current Preferences: ", localStorage.getItem("preferences"))

    displayWelcomeUser(username)
    
}

function reloadListener(username: string) {
    // Reload Username
    displayWelcomeUser(username)

    // Reload Preferences
    const preferencesStr = localStorage.getItem("preferences")
    console.log("Saved Preferences in Local Storage: ", preferencesStr)
    const preferences: UserPreferences = preferencesStr ? JSON.parse(preferencesStr) : defaultPreferences

    // Restore Genre Button colors
    const buttons = document.querySelectorAll("[class^='genre-button']")
    buttons.forEach( (b, index) => {
        const button = b as HTMLElement
        switch (index) {
            case 0:
                if(preferences.genre.electronic) {
                    button.style.backgroundColor = "grey"  // I really should rewrite this
                }
                break
            case 1:
                if(preferences.genre.lofi) {
                    button.style.backgroundColor = "grey"
                }
                break
            case 2:
                if(preferences.genre.ambient) {
                    button.style.backgroundColor = "grey"
                }
                break
            case 3:
                if(preferences.genre.classical) {
                    button.style.backgroundColor = "grey"
                }
                break
            default:
                break
        }
    });

    // Restore DJ Selection
    const djSelector = document.getElementById("DJ") as HTMLSelectElement
    if (djSelector) {
        for (let i = 0; i < djSelector.options.length; i++) {
            if (djSelector.options[i].value === preferences.DJ) {
                djSelector.selectedIndex = i
                break
            }
        }
    }

    if (typeof window.applyCurrentFilters === 'function') {
        window.applyCurrentFilters()
    }
}

window.login = login
window.logout = logout
window.welcomeListener = welcomeListener
window.reloadListener = reloadListener

export {}