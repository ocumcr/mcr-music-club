import { EventHandlers } from "./EventHandlers.js"
import { Sound } from "../Model/Sound.js"
import { Content } from "../View/Content.js"

export class NavigationEvents {
    static init() {
        if (!("mediaSession" in navigator)) return

        // 再生コントロール対応
        this.#set("play", (e) => {
            Content.addLog(e.action)
            navigator.mediaSession.playbackState = "playing"
            EventHandlers.togglePlayback()
        })

        this.#set("pause", (e) => {
            Content.addLog(e.action)
            navigator.mediaSession.playbackState = "paused"
            EventHandlers.togglePlayback()
        })

        this.#set("nexttrack", (e) => {
            Content.addLog(e.action)
            EventHandlers.handleForward()
        })

        this.#set("previoustrack", (e) => {
            Content.addLog(e.action)
            EventHandlers.handleBack()
        })

        this.#set("seekto", (e) => {
            Content.addLog(e.action + ": " + e.seekTime)

            Sound.currentTime = +e.seekTime!
        })

        this.#set("seekbackward", (e) => {
            Content.addLog(e.action + ": " + e.seekOffset)

            Sound.currentTime -= +e.seekOffset!
        })

        this.#set("seekforward", (e) => {
            Content.addLog(e.action + ": " + e.seekOffset)

            Sound.currentTime += +e.seekOffset!
        })
    }

    static #set(action: MediaSessionAction, handler: MediaSessionActionHandler) {
        navigator.mediaSession.setActionHandler(action, handler)
    }
}
