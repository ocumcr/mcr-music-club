// プレイリスト管理のクラス
export class PlaylistManager {
    static playlist: Readonly<Track[]> = []
    static defaultOrderPlaylist: Readonly<Track[]> = []

    static currentTrackTitle: string = ""

    static getCurrentTrackIndex(): number {
        return this.playlist.findIndex((track) => track.title === this.currentTrackTitle)
    }

    static isAvailable() {
        return this.currentTrackTitle !== ""
    }

    static setPlaylist(playlist: readonly Track[], shuffle: boolean) {
        this.defaultOrderPlaylist = playlist
        this.playlist = shuffle ? this.#shuffleArray([...playlist]) : playlist
    }

    static setDefaultOrder() {
        this.playlist = [...this.defaultOrderPlaylist]
    }

    static shufflePlaylist({ moveCurrentTrackToTop }: { moveCurrentTrackToTop: boolean }) {
        if (this.isAvailable()) {
            const currentTrack = this.playlist[this.getCurrentTrackIndex()]

            // 今再生しているトラックを一番目に持ってくる
            do {
                this.playlist = this.#shuffleArray([...this.playlist])
            } while (moveCurrentTrackToTop && this.playlist[0] != currentTrack)
        } else {
            this.playlist = this.#shuffleArray([...this.playlist])
        }
    }

    static getNextTrack() {
        if (!this.isAvailable()) return { track: this.playlist[0] }
        const nextIndex = (this.getCurrentTrackIndex() + 1) % this.playlist.length
        return { track: this.playlist[nextIndex] }
    }

    static getPreviousTrack() {
        if (!this.isAvailable()) return { track: this.playlist[0] }
        const prevIndex = (this.getCurrentTrackIndex() - 1 + this.playlist.length) % this.playlist.length
        return { track: this.playlist[prevIndex] }
    }

    static #shuffleArray(array: any[]) {
        if (array.length == 1) return [...array]

        return [...array].reduce((_, cur, idx, arr) => {
            const rand = Math.floor(Math.random() * (idx + 1))
            ;[arr[idx], arr[rand]] = [arr[rand], cur]
            return arr
        })
    }
}
