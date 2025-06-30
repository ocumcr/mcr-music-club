import { EventHandlers, FooterEvents } from "./EventHandler.js"
import { LocalStorage } from "./LocalStorage.js"
import { PlayerState } from "./PlayerState.js"
import { Sound } from "./Sound.js"

// Soundを使うクラス
export class SoundController {
    static async loadTrack(track: Track) {
        await Sound.load(track.path, PlayerState.loopMode === 2)

        FooterEvents.setupSeekBarUpdate(Sound.audio!)
        EventHandlers.setupTrackEndedHandler(Sound.audio!)

        this.updateVolume()
    }

    static updateVolume() {
        Sound.setVolume(+LocalStorage.volume / 100)
    }

    static setLoop(loop: boolean) {
        if (!Sound.isReady()) return
        Sound.audio.loop = loop

        PlayerState.loopMode = loop ? 2 : 0
        LocalStorage.loopMode = PlayerState.loopMode
    }

    static play() {
        if (!Sound.isReady()) return
        Sound.audio.play()
    }

    static pause() {
        if (!Sound.isReady()) return
        Sound.audio.pause()
    }

    static isPlaying(): boolean {
        return Sound.isReady() && !Sound.audio.paused
    }

    static getDuration(): number {
        return Sound.isReady() ? Sound.audio.duration : 0
    }

    static set currentTime(second: number) {
        if (!Sound.isReady()) return
        Sound.audio.currentTime = second
    }

    static get currentTime(): number {
        return Sound.isReady() ? Sound.audio.currentTime : 0
    }
}
