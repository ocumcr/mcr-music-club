import { EventHandlers } from "./EventHandlers.js"
import { Sound } from "../Model/Sound.js"
import { Content } from "../View/Content.js"

export class Navigation {
    static setPositionState(audio: HTMLAudioElement) {
        if (!("mediaSession" in navigator)) return

        navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
        })
    }

    static setNavigationMenu(track: Track) {
        if (!("mediaSession" in navigator)) return

        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title ?? "",
            artist: track.author ?? "",
            artwork: [{ src: track.thumbnail ?? "" }],
        })
    }

    static init() {
        if (!("mediaSession" in navigator)) return

        // 再生コントロール対応
        navigator.mediaSession.setActionHandler("play", (e) => {
            Content.addLog(e.action)
            navigator.mediaSession.playbackState = "playing"
            EventHandlers.togglePlayback()
        })

        navigator.mediaSession.setActionHandler("pause", (e) => {
            Content.addLog(e.action)
            navigator.mediaSession.playbackState = "paused"
            EventHandlers.togglePlayback()
        })

        navigator.mediaSession.setActionHandler("nexttrack", (e) => {
            Content.addLog(e.action)
            EventHandlers.handleForward()
        })

        navigator.mediaSession.setActionHandler("previoustrack", (e) => {
            Content.addLog(e.action)
            EventHandlers.handleBack()
        })

        navigator.mediaSession.setActionHandler("seekto", (e) => {
            Content.addLog(e.action + ": " + e.seekTime)

            Sound.currentTime = +e.seekTime!
        })

        navigator.mediaSession.setActionHandler("seekbackward", (e) => {
            Content.addLog(e.action + ": " + e.seekOffset)

            Sound.currentTime -= +e.seekOffset!
        })

        navigator.mediaSession.setActionHandler("seekforward", (e) => {
            Content.addLog(e.action + ": " + e.seekOffset)

            Sound.currentTime += +e.seekOffset!
        })
    }
}
