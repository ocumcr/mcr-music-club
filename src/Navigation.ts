import { EventHandlers } from "./EventHandler.js"
import { Sound } from "./Sound.js"
import { Content } from "./UI.js"

export class Navigation {
    static setNavigationMenu(track: Track) {
        if (!("mediaSession" in navigator)) return

        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title ?? "",
            artist: track.author ?? "",
            artwork: [{ src: track.thumbnail ?? "" }],
        })
    }

    static setupNavigationMenu() {
        if (!("mediaSession" in navigator)) return

        navigator.mediaSession.setPositionState({})

        // 再生コントロール対応
        navigator.mediaSession.setActionHandler("play", (e) => {
            addLog(e.action)
            navigator.mediaSession.playbackState = "playing"
            EventHandlers.togglePlayback()
        })

        navigator.mediaSession.setActionHandler("pause", (e) => {
            addLog(e.action)
            navigator.mediaSession.playbackState = "paused"
            EventHandlers.togglePlayback()
        })

        navigator.mediaSession.setActionHandler("nexttrack", (e) => {
            addLog(e.action)
            EventHandlers.handleForwardButton()
        })

        navigator.mediaSession.setActionHandler("previoustrack", (e) => {
            addLog(e.action)
            EventHandlers.handleBackButton()
        })

        navigator.mediaSession.setActionHandler("seekto", (e) => {
            addLog(e.action + ": " + e.seekTime)

            if (!Sound.isReady()) return

            Sound.audio.currentTime = +e.seekTime!
        })

        navigator.mediaSession.setActionHandler("seekbackward", (e) => {
            addLog(e.action + ": " + e.seekOffset)

            if (!Sound.isReady()) return

            Sound.audio.currentTime -= +e.seekOffset!
        })

        navigator.mediaSession.setActionHandler("seekforward", (e) => {
            addLog(e.action + ": " + e.seekOffset)

            if (!Sound.isReady()) return

            Sound.audio.currentTime += +e.seekOffset!
        })
    }
}

const addLog = (text: string) => {
    console.log(text)
    // document.getElementById("debug-log").innerHTML += navigator.mediaSession.playbackState + "<br />"
    Content.debugLog.innerHTML += text + "<br />"
}
