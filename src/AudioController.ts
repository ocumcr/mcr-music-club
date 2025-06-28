import { PlayerState } from "./PlayerState.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { safeSendPlayCount } from "./playMusic.js"
import { Sound } from "./Sound.js"
import { UI } from "./UI.js"

// オーディオ処理のクラス<-UI,PlayerState
export class AudioController {
    static async initializeAudio(track: Track) {
        await Sound.load(track.path, PlayerState.loopMode === 2)

        if (!Sound.isReady()) return

        this.#setupSeekBarUpdate(Sound.audio)

        this.updateVolume()
    }

    static #setupSeekBarUpdate(audio: HTMLAudioElement) {
        // 再生中にシークバーを更新
        audio.ontimeupdate = () => {
            UI.updateSeekBarAndCurrentTimeUI(audio.currentTime)

            navigator.mediaSession.setPositionState({
                duration: audio.duration,
                playbackRate: audio.playbackRate,
                position: audio.currentTime,
            })

            // ループ再生を検知
            if (PlayerState.loopMode == 2 && audio.duration - audio.currentTime < 0.65) {
                safeSendPlayCount(PlaylistManager.getCurrentTrackTitle())
            }
        }
    }

    static updateVolume() {
        Sound.setVolume(+UI.elements.volumeControl.value / 100)
    }
}
