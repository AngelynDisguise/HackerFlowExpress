interface Window {
    initialData: {
        djs: Array<{
            djID: number
            name: string
            songs: number[]
            events: {
                eventID: number
                dj: string
                time: string
                songs: string[]
            }[]
        }>
        songs: Array<{
            songID: number
            title: string
            album: string
            artist: string
            genre: {
                electronic: boolean
                lofi: boolean
                ambient: boolean
                classical: boolean
            }
            popularity: number
        }>
    }
    // login.js
    login: () => void
    logout: () => void
    welcomeListener: (username: string) => void
    reloadListener: (username: string) => void
    
    // listener.js
    validateForm: (event: Event) => boolean
    clearSearch: () => void
    applyCurrentFilters: () => void
}

declare const io: {
    (): {
        on: (event: string, callback: (...args: any[]) => void) => void
        emit: (event: string, ...args: any[]) => void
    }
}

declare const axios: {
    get: <T = any>(url: string, config?: any) => Promise<{data: T}>
    post: <T = any>(url: string, data?: any, config?: any) => Promise<{data: T}>
    put: <T = any>(url: string, data?: any, config?: any) => Promise<{data: T}>
    delete: <T = any>(url: string, config?: any) => Promise<{data: T}>
    request: <T = any>(config: any) => Promise<{data: T}>
}
