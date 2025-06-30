import { Sound } from "../Sound.js"
import { PlaylistManager } from "../PlaylistManager.js"
import { Navigation } from "../Navigation.js"

import { Footer } from "../UI/Footer.js"
import { Content } from "../UI/Content.js"
import { LocalStorage } from "../LocalStorage.js"
import { FooterEvents } from "./FooterEvents.js"
import { Survey } from "../Survey.js"

// イベントハンドラの設定
export class EventHandlers {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#setupKeyboardControls()
        this.#setupVisibilityHandler()

        this.#initialized = true
    }

    static togglePlayback() {
        if (!PlaylistManager.isAvailable()) return

        if (Sound.isPlaying()) {
            Sound.pause()
            Footer.updatePlayButtonUI(false)
        } else {
            Sound.play()
            Footer.updatePlayButtonUI(true)
        }

        Content.updatePlayingClass(PlaylistManager.currentTrackIndex)
    }

    static async handleBack() {
        if (Sound.currentTime > 0.5) {
            Sound.currentTime = 0
            return
        }

        const { track, index } = PlaylistManager.getPreviousTrack()
        await this.changeTrack(track, index)
        Content.scrollTo(PlaylistManager.currentTrackIndex - 1)
    }

    static async handleForward() {
        const { track, index } = PlaylistManager.getNextTrack()
        await this.changeTrack(track, index)
        Content.scrollTo(PlaylistManager.currentTrackIndex - 1)
    }

    static async changeTrack(track: Track, index: number) {
        await Sound.load(track.path, LocalStorage.loopMode === 2)
        Sound.setVolume(LocalStorage.volume / 100)
        Sound.play()

        FooterEvents.setupSeekBarUpdate(Sound.audio!)
        this.#setupTrackEnded(Sound.audio!)

        const duration = Sound.getDuration()

        Footer.updateTrackInfo(track)
        Footer.updatePlayButtonUI(true)
        Footer.updateSeekBarMax(duration)
        Footer.updateDurationText(duration)
        Content.updatePlayingClass(index)

        Navigation.setNavigationMenu(track)

        PlaylistManager.currentTrackIndex = index

        Survey.safeSendPlayCount(track.title)
    }

    static #setupTrackEnded(audio: HTMLAudioElement) {
        audio.onended = () => {
            if (LocalStorage.loopMode === 1) {
                this.handleForward()
                //
            } else if (LocalStorage.loopMode === 0) {
                const { track, index } = PlaylistManager.getNextTrack()

                if (index === 0) {
                    // 止める
                    Footer.updatePlayButtonUI(false)
                } else {
                    this.changeTrack(track, index)
                }
            }
        }
    }

    static #setupKeyboardControls() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault()
                this.togglePlayback()
            }
        })
    }

    static #setupVisibilityHandler() {
        // document.addEventListener("visibilitychange", async (e) => {
        //     addLog("visibility changed: " + document.visibilityState)
        //     addLog("OS: " + getMobileOS())
        //     if (getMobileOS() != "iOS") return
        //     if (document.visibilityState === "visible") {
        //         if (PlayerState.wasPlaying) {
        //             PlayerState.audio.play()
        //         }
        //         const interval = setInterval(() => {
        //             addLog(PlayerState.audio.playbackRate)
        //         }, 1000 / 24)
        //         setTimeout(() => {
        //             clearInterval(interval)
        //         }, 10000)
        //     } else {
        //         // ページから離れる時の処理
        //         PlayerState.wasPlaying = !PlayerState.audio.paused
        //         PlayerState.audio.pause()
        //     }
        // })
    }
}
