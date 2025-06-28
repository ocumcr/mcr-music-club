import { PlayerState } from "./PlayerState.js";
import { PlaylistManager } from "./PlaylistManager.js";
import { safeSendPlayCount } from "./playMusic.js";
import { Sound } from "./Sound.js";
import { Footer } from "./UI.js";
// Soundを使うクラス
export class SoundController {
    static async loadTrack(track) {
        await Sound.load(track.path, PlayerState.loopMode === 2);
        if (!Sound.isReady())
            return;
        this.#setupSeekBarUpdate(Sound.audio);
        this.updateVolume();
    }
    static setCurrentTime(second) {
        if (!Sound.isReady())
            return;
        Sound.audio.currentTime = second;
    }
    static #setupSeekBarUpdate(audio) {
        // 再生中にシークバーを更新
        audio.ontimeupdate = () => {
            Footer.updateSeekBarAndCurrentTimeUI(audio.currentTime);
            navigator.mediaSession.setPositionState({
                duration: audio.duration,
                playbackRate: audio.playbackRate,
                position: audio.currentTime,
            });
            // ループ再生を検知
            if (PlayerState.loopMode == 2 && audio.duration - audio.currentTime < 0.65) {
                const title = PlaylistManager.getCurrentTrackTitle();
                title && safeSendPlayCount(title);
            }
        };
    }
    static updateVolume() {
        Sound.setVolume(+Footer.elements.volumeControl.value / 100);
    }
}
