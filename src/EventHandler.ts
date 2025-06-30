import { SoundController } from "./SoundController.js"
import { LoopMode, PlayerState, ShuffleMode } from "./PlayerState.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { handleQueryChange, safeSendPlayCount } from "./playMusic.js"
import { Header, Footer, Content } from "./UI.js"
import { LocalStorage } from "./LocalStorage.js"
import { URLManager } from "./URLManager.js"
import { Navigation } from "./Navigation.js"

export class HeaderEvents {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#setupForm()
        this.#setupTitle()

        this.#initialized = true
    }

    static #setupForm() {
        const form = document.querySelector<HTMLFormElement>(".search")!

        form.onsubmit = (e) => {
            e.preventDefault()
            URLManager.setSearchQuery(Header.search.value)
            handleQueryChange()
        }
    }

    static #setupTitle() {
        Header.title.addEventListener("click", (e) => {
            e.preventDefault()

            URLManager.clearSearchQuery()

            handleQueryChange()
        })
    }
}

export class FooterEvents {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#setupPlaybackControls()
        this.#setupSeekBarControls()
        this.#setupVolumeControls()
        this.#setupLoopControls()
        this.#setupShuffleControls()

        this.#initialized = true
    }

    static setupSeekBarUpdate(audio: HTMLAudioElement) {
        // 再生中にシークバーを更新
        audio.ontimeupdate = () => {
            Footer.updateSeekBarAndCurrentTimeUI(audio.currentTime)

            Navigation.setPositionState(audio)

            // ループ再生を検知
            if (PlayerState.loopMode == 2 && audio.duration - audio.currentTime < 0.65) {
                const title = PlaylistManager.getCurrentTrackTitle()
                title && safeSendPlayCount(title)
            }
        }
    }

    static #setupPlaybackControls() {
        Footer.elements.playButton.onclick = () => EventHandlers.togglePlayback()
        Footer.elements.backButton.onclick = () => EventHandlers.handleBack()
        Footer.elements.forwardButton.onclick = () => EventHandlers.handleForward()
    }

    static #setupSeekBarControls() {
        Footer.elements.seekBar.oninput = () => {
            SoundController.currentTime = +Footer.elements.seekBar.value
        }
    }

    static #setupVolumeControls() {
        Footer.elements.volumeControl.oninput = (e) => {
            LocalStorage.volume = +(e.target as HTMLInputElement).value
            SoundController.updateVolume()
        }
    }

    static #setupLoopControls() {
        Footer.elements.loopButton.onclick = () => {
            PlayerState.loopMode = ((PlayerState.loopMode + 1) % 3) as LoopMode

            LocalStorage.loopMode = PlayerState.loopMode

            Footer.updateLoopButtonUI(PlayerState.loopMode)

            SoundController.setLoop(PlayerState.loopMode === 2)
        }
    }

    static #setupShuffleControls() {
        Footer.elements.shuffleButton.onclick = () => {
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

            Content.renderPlaylist(PlaylistManager.playlist)
            Content.updateNowPlayingTrack(PlaylistManager.currentTrackIndex)
            Content.scrollTo(PlaylistManager.currentTrackIndex)
        }
    }
}

export class ContentEvents {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#setupMiniThumbnail()

        this.#initialized = true
    }

    static #setupMiniThumbnail() {
        Footer.elements.musicTitle.addEventListener("click", () => {
            Content.scrollTo(PlaylistManager.currentTrackIndex)
        })
    }

    static setupTrackClickEvents(playlist: readonly Track[]) {
        document.querySelectorAll(".track").forEach((track, i) => {
            track.querySelector(".img-box")!.addEventListener("click", async () => {
                if (PlaylistManager.currentTrackIndex === i) {
                    // 現在のトラックがクリックされた場合は再生/一時停止を切り替える
                    EventHandlers.togglePlayback()
                } else {
                    // 別のトラックがクリックされた場合はそのトラックを再生する
                    await EventHandlers.changeTrack(playlist[i], i)
                }
            })

            track.querySelectorAll(".tag-button").forEach((button, j) => {
                button.addEventListener("click", () => {
                    this.#onClickTag(playlist[i].tags[j])
                })
            })
        })
    }

    static #onClickTag(tag: string) {
        URLManager.setSearchQuery(tag)
        handleQueryChange()
    }
}

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
        if (SoundController.isPlaying()) {
            SoundController.pause()
            Footer.updatePlayButtonUI(false)
        } else {
            SoundController.play()
            Footer.updatePlayButtonUI(true)
        }

        Content.updateNowPlayingTrack(PlaylistManager.currentTrackIndex)
    }

    static async handleBack() {
        if (SoundController.currentTime > 0.5) {
            SoundController.currentTime = 0
            return
        }

        const previousTrack = PlaylistManager.getPreviousTrack()

        if (!previousTrack) return

        const { track, index } = previousTrack
        await EventHandlers.changeTrack(track, index)
    }

    static async handleForward() {
        const isLastTrack = PlaylistManager.playlist.length - 1 === PlaylistManager.currentTrackIndex

        if (isLastTrack) {
            Content.scrollTo(-1)
        }

        if (isLastTrack && PlayerState.shuffleMode === 1) {
            PlaylistManager.shufflePlaylist({
                moveCurrentTrackToTop: false,
            })

            Content.renderPlaylist(PlaylistManager.playlist)
            Content.updateNowPlayingTrack(PlaylistManager.currentTrackIndex)
            Content.scrollTo(PlaylistManager.currentTrackIndex)
        }

        const nextTrack = PlaylistManager.getNextTrack()

        if (!nextTrack) return

        const { track, index } = nextTrack
        await EventHandlers.changeTrack(track, index)
    }

    static async changeTrack(track: Track, index: number) {
        await SoundController.loadTrack(track)

        const duration = SoundController.getDuration()

        Footer.updateTrackInfo(track)
        Footer.updatePlayButtonUI(true)
        Footer.updateSeekBarMax(duration)
        Footer.updateDurationUI(duration)
        Content.updateNowPlayingTrack(index)

        Navigation.setNavigationMenu(track)

        PlaylistManager.currentTrackIndex = index
        SoundController.play()

        const title = PlaylistManager.getCurrentTrackTitle()
        title && safeSendPlayCount(title)
    }

    static setupTrackEndedHandler(audio: HTMLAudioElement) {
        audio.onended = () => {
            if (PlayerState.loopMode === 1) {
                this.handleForward()
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
