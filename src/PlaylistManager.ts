// プレイリスト管理のクラス
export class PlaylistManager {
    static playlist: Readonly<Track[]> = []
    static defaultOrderPlaylist: Readonly<Track[]> = []

    static currentTrackIndex: number = -1

    static isAvailable() {
        return this.currentTrackIndex !== -1
    }

    static setPlaylist(playlist: readonly Track[], shuffle: boolean) {
        this.defaultOrderPlaylist = playlist
        this.playlist = shuffle ? this.#shuffleArray([...playlist]) : playlist
    }

    static setDefaultOrder() {
        if (this.isAvailable()) {
            const currentTrack = this.playlist[this.currentTrackIndex]

            this.currentTrackIndex = this.defaultOrderPlaylist.indexOf(currentTrack)
        }

        this.playlist = [...this.defaultOrderPlaylist]
    }

    static shufflePlaylist({ moveCurrentTrackToTop }: { moveCurrentTrackToTop: boolean }) {
        if (this.isAvailable()) {
            const currentTrack = this.playlist[this.currentTrackIndex]

            // 今再生しているトラックを一番目に持ってくる
            do {
                this.playlist = this.#shuffleArray([...this.playlist])
            } while (moveCurrentTrackToTop && this.playlist[0] != currentTrack)

            if (moveCurrentTrackToTop) {
                this.currentTrackIndex = 0
            }
        } else {
            this.playlist = this.#shuffleArray([...this.playlist])
        }
    }

    static getCurrentTrackTitle(): string | null {
        if (!this.isAvailable()) return null
        return this.playlist[this.currentTrackIndex].title
    }

    static getNextTrack() {
        if (!this.isAvailable()) return { track: this.playlist[0], index: 0 }
        const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length
        return { track: this.playlist[nextIndex], index: nextIndex }
    }

    static getPreviousTrack() {
        if (!this.isAvailable()) return { track: this.playlist[0], index: 0 }
        const prevIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length
        return { track: this.playlist[prevIndex], index: prevIndex }
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
