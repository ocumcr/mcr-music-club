import { Sound } from "../Model/Sound.js"

import { Footer } from "../View/Footer.js"
import { Content } from "../View/Content.js"
import { Navigation } from "../View/Navigation.js"

import { LocalStorage } from "../Model/LocalStorage.js"
import { Survey } from "../Model/Survey.js"
import { PlaylistManager } from "./PlaylistManager.js"

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
            Content.updatePlayingClass(PlaylistManager.getPlayingTrackIndex())
        }
    }

    static async handleBack() {
        if (Sound.currentTime > 0.5) {
            Sound.currentTime = 0
            return
        }

        const { track } = PlaylistManager.getPreviousTrack()
        await this.changeTrack(track)
        Content.scrollTo(PlaylistManager.getPlayingTrackIndex())
    }

    static async handleForward({ scroll = true } = {}) {
        const { track } = PlaylistManager.getNextTrack()
        await this.changeTrack(track)
        scroll && Content.scrollTo(PlaylistManager.getPlayingTrackIndex())
    }

    static async changeTrack(track: Track) {
        PlaylistManager.playingTrackTitle = track.title
        if (!PlaylistManager.hasPlayingTrack())
            throw new Error("謎の方法でplaylistに存在しない曲を選択しようとしているにゃ！")

        const index = PlaylistManager.getPlayingTrackIndex()

        // 選択したトラックをローディング状態にする
        Content.updatePlayingClass(index)
        Content.setLoading(index)

        // 読み込んで再生
        await Sound.load(track.path)
        Sound.setVolume(LocalStorage.volume / 100)
        Sound.setLoop(LocalStorage.loopMode === 2)
        Sound.play()

        // 表示を更新
        Footer.updateTrackInfo(track)
        Footer.updatePlayButtonUI(true)
        Footer.updateSeekBarMaxAndDurationText(Sound.getDuration())
        Content.updatePlayingClass(index)
        Navigation.setNavigationMenu(track)

        //
        this.#setupSeekBarUpdate(Sound.audio!)
        this.#setupTrackEnded(Sound.audio!)

        // 再生回数を更新
        Survey.safeSendPlayCount(track.title)
    }

    static #setupSeekBarUpdate(audio: HTMLAudioElement) {
        // 再生中にシークバーを更新
        audio.ontimeupdate = () => {
            Footer.updateSeekBarAndCurrentTimeText(audio.currentTime)
            Navigation.setPositionState(audio)

            // ループ再生を検知
            if (LocalStorage.loopMode == 2 && audio.duration - audio.currentTime < 0.65) {
                const title = PlaylistManager.playingTrackTitle
                title && Survey.safeSendPlayCount(title)
            }
        }
    }

    static #setupTrackEnded(audio: HTMLAudioElement) {
        audio.onended = () => {
            const isLast = PlaylistManager.getPlaylist().length - 1 === PlaylistManager.getPlayingTrackIndex()

            if (LocalStorage.loopMode === 1) {
                if (isLast) {
                    PlaylistManager.shufflePlaylist({ moveCurrentTrackToTop: false })
                    this.changeTrack(PlaylistManager.getPlaylist()[0])
                    Content.scrollTo(-1)
                    return
                }

                this.handleForward({ scroll: false })

                //
            } else if (LocalStorage.loopMode === 0) {
                if (isLast) {
                    // 止める
                    Footer.updatePlayButtonUI(false)
                    Content.updatePlayingClass(-1)
                    return
                }

                // 勝手に終わった時にスクロールするのは嫌でしょう？
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
