import { Sound } from "../Model/Sound.js"
import { PlaylistManager } from "../Model/PlaylistManager.js"
import { Navigation } from "./Navigation.js"

import { Footer } from "../View/Footer.js"
import { Content } from "../View/Content.js"
import { LocalStorage } from "../Model/LocalStorage.js"
import { FooterEvents } from "./FooterEvents.js"
import { Survey } from "../Model/Survey.js"

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
        if (!Sound.isReady()) return

        if (Sound.isPlaying()) {
            Sound.pause()
            Footer.updatePlayButtonUI(false)
            Content.updatePlayingClass(-1)
        } else {
            Sound.play()
            Footer.updatePlayButtonUI(true)
            Content.updatePlayingClass(PlaylistManager.currentTrackIndex)
        }
    }

    static async handleBack() {
        if (Sound.currentTime > 0.5) {
            Sound.currentTime = 0
            return
        }

        const { track, index } = PlaylistManager.getPreviousTrack()
        await this.changeTrack(track, index)
        Content.scrollTo(PlaylistManager.currentTrackIndex)
    }

    static async handleForward({ scroll = true } = {}) {
        const { track, index } = PlaylistManager.getNextTrack()
        await this.changeTrack(track, index)
        scroll && Content.scrollTo(PlaylistManager.currentTrackIndex)
    }

    static async changeTrack(track: Track, index: number) {
        Content.updatePlayingClass(index)

        await Sound.load(track.path)
        Sound.setVolume(LocalStorage.volume / 100)
        Sound.setLoop(LocalStorage.loopMode === 2)
        Sound.play()

        FooterEvents.setupSeekBarUpdate(Sound.audio!)
        this.#setupTrackEnded(Sound.audio!)

        Footer.updateTrackInfo(track)
        Footer.updatePlayButtonUI(true)
        Footer.updateSeekBarMaxAndDurationText(Sound.getDuration())
        Content.setClassPlaying(index)

        Navigation.setNavigationMenu(track)

        PlaylistManager.currentTrackIndex = index

        Survey.safeSendPlayCount(track.title)
    }

    static #setupTrackEnded(audio: HTMLAudioElement) {
        audio.onended = () => {
            if (LocalStorage.loopMode === 1) {
                this.handleForward({ scroll: false })
                //
            } else if (LocalStorage.loopMode === 0) {
                const isLast = PlaylistManager.playlist.length - 1 === PlaylistManager.currentTrackIndex

                if (isLast) {
                    // 止める
                    Footer.updatePlayButtonUI(false)
                    Content.updatePlayingClass(-1)
                    return
                }

                this.handleForward({ scroll: false })
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
