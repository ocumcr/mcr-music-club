// グローバル状態の管理
export class PlayerState {
    static data: Track[] = []
    static record: {
        [k: string]: number
    } = {}
    static wasPlaying = false

    static playCounted = false
    static loopMode = parseInt(localStorage.getItem("loopMode") ?? "0")
    static shuffleMode = parseInt(localStorage.getItem("shuffleMode") ?? "0")
    static currentTrackIndex = 0

    static playlist: Track[] = []
    static defaultOrderPlaylist: Track[] = []
}
