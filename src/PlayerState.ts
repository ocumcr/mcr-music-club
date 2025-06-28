import { LocalStorage } from "./LocalStorage.js"

// グローバル状態の管理
export class PlayerState {
    static data: Track[] = []
    static record: {
        [k: string]: number
    } = {}
    static wasPlaying = false

    static playCounted = false
    static loopMode = LocalStorage.loopMode
    static shuffleMode = LocalStorage.shuffleMode
    static currentTrackIndex = 0

    static playlist: Track[] = []
    static defaultOrderPlaylist: Track[] = []
}
