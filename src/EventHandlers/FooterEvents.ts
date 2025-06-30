import { LocalStorage } from "../LocalStorage.js"
import { Navigation } from "../Navigation.js"
import { PlaylistManager } from "../PlaylistManager.js"
import { Sound } from "../Sound.js"

import { Content } from "../UI/Content.js"
import { Footer } from "../UI/Footer.js"

import { EventHandlers } from "./EventHandlers.js"
import { Survey } from "../Survey.js"

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

    static setupSeekBarUpdate(audio: HTMLAudioElement) {
        // 再生中にシークバーを更新
        audio.ontimeupdate = () => {
            Footer.updateSeekBarAndCurrentTimeText(audio.currentTime)

            Navigation.setPositionState(audio)

            // ループ再生を検知
            if (LocalStorage.loopMode == 2 && audio.duration - audio.currentTime < 0.65) {
                const title = PlaylistManager.getCurrentTrackTitle()
                title && Survey.safeSendPlayCount(title)
            }
        }
    }

    static #setupMiniThumbnail() {
        Footer.elements.musicTitle.addEventListener("click", () => {
            Content.scrollTo(PlaylistManager.currentTrackIndex - 1)
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

            LocalStorage.loopMode = LocalStorage.loopMode

            Footer.updateLoopButtonUI(LocalStorage.loopMode)

            Sound.setLoop(LocalStorage.loopMode === 2)
        }
    }

    static #setupShuffleControls() {
        Footer.elements.shuffleButton.onclick = () => {
            LocalStorage.shuffleMode = (1 - LocalStorage.shuffleMode) as ShuffleMode

            LocalStorage.shuffleMode = LocalStorage.shuffleMode

            Footer.updateShuffleButtonUI(LocalStorage.shuffleMode)

            if (LocalStorage.shuffleMode === 1) {
                PlaylistManager.shufflePlaylist({
                    moveCurrentTrackToTop: true,
                })
            } else {
                PlaylistManager.setDefaultOrder()
            }

            Content.renderPlaylist(PlaylistManager.playlist)
            Content.updatePlayingClass(PlaylistManager.currentTrackIndex)
            Content.scrollTo(PlaylistManager.currentTrackIndex - 1)
        }
    }
}
