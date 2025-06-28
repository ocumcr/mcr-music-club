import { AudioController } from "./AudioController.js";
import { PlayerState } from "./PlayerState.js";
import { PlaylistManager } from "./PlaylistManager.js";
import { formatTime, handleQueryChange, safeSendPlayCount, setNavigationMenu } from "./playMusic.js";
import { Sound } from "./Sound.js";
import { Path, UI } from "./UI.js";
// イベントハンドラの設定
export class EventHandlers {
    static initialize() {
        this.#setupPlaybackControls();
        this.#setupSeekBarControls();
        this.#setupVolumeControls();
        this.#setupLoopAndShuffleControls();
        this.#setupKeyboardControls();
        this.#setupTitle();
        this.#setupMiniThumbnail();
        this.#setupVisibilityHandler();
    }
    static #setupPlaybackControls() {
        UI.elements.playButton.addEventListener("click", () => this.togglePlayback());
        UI.elements.backButton.onclick = () => this.handleBackButton();
        UI.elements.forwardButton.onclick = () => this.handleForwardButton();
    }
    static #setupSeekBarControls() {
        UI.elements.seekBar.addEventListener("input", () => {
            if (!Sound.isReady())
                return;
            Sound.audio.currentTime = +UI.elements.seekBar.value;
        });
    }
    static #setupVolumeControls() {
        UI.elements.volumeControl.addEventListener("input", (e) => {
            localStorage.setItem("volume", "" + e.target.value);
            AudioController.updateVolume();
        });
    }
    static #setupLoopAndShuffleControls() {
        UI.elements.loopButton.addEventListener("click", () => {
            PlayerState.loopMode = (PlayerState.loopMode + 1) % 3;
            localStorage.setItem("loopMode", "" + PlayerState.loopMode);
            UI.updateLoopButtonUI();
            if (Sound.isReady()) {
                Sound.audio.loop = PlayerState.loopMode === 2;
            }
        });
        UI.elements.shuffleButton.addEventListener("click", () => {
            PlayerState.shuffleMode = 1 - PlayerState.shuffleMode;
            localStorage.setItem("shuffleMode", "" + PlayerState.shuffleMode);
            UI.updateShuffleButtonUI();
            if (PlayerState.shuffleMode === 1) {
                PlaylistManager.shufflePlaylist({
                    moveCurrentTrackToTop: true,
                });
            }
            else {
                PlaylistManager.setOrder();
            }
        });
    }
    static #setupTitle() {
        Path.title.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState(null, "", window.location.origin + window.location.pathname);
            handleQueryChange();
        });
    }
    static #setupKeyboardControls() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                this.togglePlayback();
            }
        });
    }
    static #setupMiniThumbnail() {
        UI.elements.musicTitle.addEventListener("click", () => {
            if (PlayerState.currentTrackIndex == 0) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
            else {
                const track = document.querySelectorAll(".track")[PlayerState.currentTrackIndex - 1];
                track.scrollIntoView({
                    behavior: "smooth",
                });
            }
        });
    }
    static togglePlayback() {
        if (!Sound.isReady())
            return;
        if (Sound.audio.paused) {
            Sound.audio.play();
            UI.updatePlayButtonUI(true);
        }
        else {
            Sound.audio.pause();
            UI.updatePlayButtonUI(false);
        }
    }
    static async handleBackButton() {
        if (Sound.audio && Sound.audio.currentTime > 0.5) {
            Sound.audio.currentTime = 0;
            return;
        }
        const { track, index } = PlaylistManager.getPreviousTrack();
        await this.changeTrack(track, index);
    }
    static async handleForwardButton() {
        this.playNextTrack();
    }
    static async changeTrack(track, index) {
        UI.removeNowPlayingTrack();
        await AudioController.initializeAudio(track);
        if (!Sound.isReady())
            return;
        UI.updateTrackInfo(track);
        UI.updatePlayButtonUI(true);
        UI.updateSeekBarMax(Sound.audio.duration);
        UI.updateDurationUI(formatTime(Sound.audio.duration));
        UI.setNowPlayingTrack({
            index: index,
        });
        setNavigationMenu(track);
        PlayerState.currentTrackIndex = index;
        Sound.audio.play();
        this.#setupTrackEndedHandler();
        safeSendPlayCount(PlaylistManager.getCurrentTrackTitle());
    }
    static async playNextTrack() {
        const isLastTrack = PlayerState.playlist.length - 1 == PlayerState.currentTrackIndex;
        if (isLastTrack) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        if (isLastTrack && PlayerState.shuffleMode == 1) {
            PlaylistManager.shufflePlaylist({
                moveCurrentTrackToTop: false,
            });
        }
        const { track, index } = PlaylistManager.getNextTrack();
        await this.changeTrack(track, index);
    }
    static #setupTrackEndedHandler() {
        if (!Sound.isReady())
            return;
        Sound.audio.onended = async () => {
            if (PlayerState.loopMode === 1) {
                this.playNextTrack();
            }
            else if (PlayerState.loopMode === 0) {
                const { track, index } = PlaylistManager.getNextTrack();
                if (index !== 0) {
                    await this.changeTrack(track, index);
                }
                else {
                    UI.updatePlayButtonUI(false);
                }
            }
        };
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
