import { SoundController } from "./SoundController.js"
import { LoopMode, PlayerState, ShuffleMode } from "./PlayerState.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { handleQueryChange, safeSendPlayCount } from "./playMusic.js"
import { Sound } from "./Sound.js"
import { Header, Footer, Content } from "./UI.js"
import { LocalStorage } from "./LocalStorage.js"
import { URLManager } from "./URLManager.js"
import { Navigation } from "./Navigation.js"

// イベントハンドラの設定
export class EventHandlers {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#setupPlaybackControls()
        this.#setupSeekBarControls()
        this.#setupVolumeControls()
        this.#setupLoopControls()
        this.#setupShuffleControls()
        this.#setupKeyboardControls()
        this.#setupTitle()
        this.#setupMiniThumbnail()
        this.#setupVisibilityHandler()

        this.#initialized = true
    }

    static #setupPlaybackControls() {
        Footer.elements.playButton.addEventListener("click", () => this.togglePlayback())
        Footer.elements.backButton.onclick = () => this.handleBackButton()
        Footer.elements.forwardButton.onclick = () => this.handleForwardButton()
    }

    static #setupSeekBarControls() {
        Footer.elements.seekBar.addEventListener("input", () => {
            SoundController.setCurrentTime(+Footer.elements.seekBar.value)
        })
    }

    static #setupVolumeControls() {
        Footer.elements.volumeControl.addEventListener("input", (e) => {
            LocalStorage.volume = +(e.target as HTMLInputElement).value
            SoundController.updateVolume()
        })
    }

    static #setupLoopControls() {
        Footer.elements.loopButton.addEventListener("click", () => {
            PlayerState.loopMode = ((PlayerState.loopMode + 1) % 3) as LoopMode

            LocalStorage.loopMode = PlayerState.loopMode

            Footer.updateLoopButtonUI(PlayerState.loopMode)

            if (Sound.isReady()) {
                Sound.audio.loop = PlayerState.loopMode === 2
            }
        })
    }

    static #setupShuffleControls() {
        Footer.elements.shuffleButton.addEventListener("click", () => {
            PlayerState.shuffleMode = (1 - PlayerState.shuffleMode) as ShuffleMode

            LocalStorage.shuffleMode = PlayerState.shuffleMode

            Footer.updateShuffleButtonUI(PlayerState.shuffleMode)

            if (PlayerState.shuffleMode === 1) {
                PlaylistManager.shufflePlaylist({
                    moveCurrentTrackToTop: true,
                })
            } else {
                PlaylistManager.setDefaultOrder()
            }
        })
    }

    static #setupTitle() {
        Header.title.addEventListener("click", (e) => {
            e.preventDefault()

            URLManager.clearSearchQuery()

            handleQueryChange()
        })
    }

    static #setupKeyboardControls() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault()
                this.togglePlayback()
            }
        })
    }

    static #setupMiniThumbnail() {
        Footer.elements.musicTitle.addEventListener("click", () => {
            if (!PlaylistManager.isAvailable()) throw Error("")
            Content.scrollTo(PlaylistManager.currentTrackIndex - 1)
        })
    }

    static togglePlayback() {
        if (!Sound.isReady()) return

        if (Sound.audio.paused) {
            Sound.audio.play()
            Footer.updatePlayButtonUI(true)
            Content.setNowPlayingTrack({ index: PlaylistManager.currentTrackIndex })
        } else {
            Sound.audio.pause()
            Footer.updatePlayButtonUI(false)
            Content.removeNowPlayingTrack()
        }
    }

    static async handleBackButton() {
        if (Sound.isReady() && Sound.audio.currentTime > 0.5) {
            Sound.audio.currentTime = 0
            return
        }

        const previousTrack = PlaylistManager.getPreviousTrack()

        if (!previousTrack) return

        const { track, index } = previousTrack
        await this.changeTrack(track, index)
    }

    static async handleForwardButton() {
        const isLastTrack = PlaylistManager.playlist.length - 1 === PlaylistManager.currentTrackIndex

        if (isLastTrack) {
            Content.scrollTo(-1)
        }

        if (isLastTrack && PlayerState.shuffleMode === 1) {
            PlaylistManager.shufflePlaylist({
                moveCurrentTrackToTop: false,
            })
        }

        const nextTrack = PlaylistManager.getNextTrack()

        if (!nextTrack) return

        const { track, index } = nextTrack
        await this.changeTrack(track, index)
    }

    static async changeTrack(track: Track, index: number) {
        Content.removeNowPlayingTrack()

        await SoundController.loadTrack(track)

        if (!Sound.isReady()) return

        Footer.updateTrackInfo(track)
        Footer.updatePlayButtonUI(true)
        Footer.updateSeekBarMax(Sound.audio.duration)
        Footer.updateDurationUI(Sound.audio.duration)
        Content.setNowPlayingTrack({
            index,
        })

        Navigation.setNavigationMenu(track)

        PlaylistManager.currentTrackIndex = index
        Sound.audio.play()

        this.#setupTrackEndedHandler(Sound.audio)

        const title = PlaylistManager.getCurrentTrackTitle()
        title && safeSendPlayCount(title)
    }

    static #setupTrackEndedHandler(audio: HTMLAudioElement) {
        audio.onended = () => {
            if (PlayerState.loopMode === 1) {
                this.handleForwardButton()
                //
            } else if (PlayerState.loopMode === 0) {
                const nextTrack = PlaylistManager.getNextTrack()

                if (!nextTrack) return

                const { track, index } = nextTrack

                if (index !== 0) {
                    this.changeTrack(track, index)
                } else {
                    Footer.updatePlayButtonUI(false)
                }
            }
        }
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
