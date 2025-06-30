export class LocalStorage {
    static set volume(volume: number) {
        localStorage.setItem("volume", "" + volume)
    }

    static get volume() {
        return localStorage["volume"] ? Number(localStorage["volume"]) : 50
    }

    static set loopMode(loopMode: LoopMode) {
        localStorage.setItem("loopMode", "" + loopMode)
    }

    static get loopMode(): LoopMode {
        return (localStorage["loopMode"] ? Number(localStorage["loopMode"]) : 0) as LoopMode
    }

    static set shuffleMode(loopMode: ShuffleMode) {
        localStorage.setItem("shuffleMode", "" + loopMode)
    }

    static get shuffleMode(): ShuffleMode {
        return (localStorage["shuffleMode"] ? Number(localStorage["shuffleMode"]) : 0) as ShuffleMode
    }
}
