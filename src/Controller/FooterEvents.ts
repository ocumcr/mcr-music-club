import { LocalStorage } from "../Model/LocalStorage.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { Sound } from "../Model/Sound.js"

import { Content } from "../View/Content.js"
import { Footer } from "../View/Footer.js"

import { EventHandlers } from "./EventHandlers.js"

export class FooterEvents {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#setupPlaybackControls()
        this.#setupSeekBarControls()
        this.#setupVolumeControls()
        this.#setupLoopControls()
        this.#setupShuffleControls()
        this.#setupMiniThumbnail()

        this.#initialized = true
    }

    static #setupMiniThumbnail() {
        Footer.elements.musicTitle.addEventListener("click", () => {
            Content.scrollTo(PlaylistManager.getPlayingTrackIndex())
        })
    }

    static #setupPlaybackControls() {
        Footer.elements.playButton.onclick = () => EventHandlers.togglePlayback()
        Footer.elements.backButton.onclick = () => EventHandlers.handleBack()
        Footer.elements.forwardButton.onclick = () => EventHandlers.handleForward()
    }

    static #setupSeekBarControls() {
        Footer.elements.seekBar.oninput = () => {
            Sound.currentTime = +Footer.elements.seekBar.value
        }
    }

    static #setupVolumeControls() {
        Footer.elements.volumeControl.oninput = (e) => {
            LocalStorage.volume = +(e.target as HTMLInputElement).value
            Sound.setVolume(LocalStorage.volume / 100)
        }
    }

    static #setupLoopControls() {
        Footer.elements.loopButton.onclick = () => {
            LocalStorage.loopMode = ((LocalStorage.loopMode + 1) % 3) as LoopMode

            Footer.updateLoopButtonUI(LocalStorage.loopMode)

            Sound.setLoop(LocalStorage.loopMode === 2)
        }
    }

    static #setupShuffleControls() {
        Footer.elements.shuffleButton.onclick = () => {
            LocalStorage.shuffleMode = (1 - LocalStorage.shuffleMode) as ShuffleMode

            if (LocalStorage.shuffleMode === 1) {
                PlaylistManager.shufflePlaylist({
                    moveCurrentTrackToTop: true,
                })
            } else {
                PlaylistManager.setDefaultOrder()
            }

            Footer.updateShuffleButtonUI(LocalStorage.shuffleMode)

            Content.scrollTo(PlaylistManager.getPlayingTrackIndex())
        }
    }
}
