import { LoopMode, ShuffleMode } from "./PlayerState"

export class LocalStorage {
    static set volume(volume: number) {
        localStorage.set("volume", "" + volume)
    }

    static get volume() {
        return localStorage["volume"] ? Number(localStorage["volume"]) : 50
    }

    static set loopMode(loopMode: LoopMode) {
        localStorage.set("loopMode", "" + loopMode)
    }

    static get loopMode(): LoopMode {
        return (localStorage["loopMode"] ? Number(localStorage["shuffleMode"]) : 0) as LoopMode
    }

    static set shuffleMode(loopMode: ShuffleMode) {
        localStorage.set("shuffleMode", "" + loopMode)
    }

    static get shuffleMode(): ShuffleMode {
        return (localStorage["shuffleMode"] ? Number(localStorage["shuffleMode"]) : 0) as ShuffleMode
    }
}
