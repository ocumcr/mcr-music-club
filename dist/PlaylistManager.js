import { PlayerState } from "./PlayerState.js";
import { Content, Footer } from "./UI.js";
// プレイリスト管理のクラス
export class PlaylistManager {
    static playlist;
    static defaultOrderPlaylist;
    static setPlaylist(playlist) {
        this.defaultOrderPlaylist = playlist;
        this.playlist = PlayerState.shuffleMode ? this.#shuffleArray([...playlist]) : playlist;
    }
    static setDefaultOrder() {
        const currentTrack = this.playlist[PlayerState.currentTrackIndex];
        PlayerState.currentTrackIndex = this.defaultOrderPlaylist.indexOf(currentTrack);
        this.playlist = [...this.defaultOrderPlaylist];
        Content.renderMusicList(this.playlist);
        Content.scrollTo(PlayerState.currentTrackIndex - 1);
        Footer.setNowPlayingTrack({ index: PlayerState.currentTrackIndex });
    }
    static shufflePlaylist({ moveCurrentTrackToTop }) {
        const currentTrack = this.playlist[PlayerState.currentTrackIndex];
        // 今再生しているトラックを一番目に持ってくる
        do {
            this.playlist = this.#shuffleArray([...this.playlist]);
        } while (moveCurrentTrackToTop && this.playlist[0] != currentTrack);
        if (moveCurrentTrackToTop) {
            PlayerState.currentTrackIndex = 0;
        }
        Content.renderMusicList(this.playlist);
        Content.scrollTo(-1);
        Footer.setNowPlayingTrack({ index: PlayerState.currentTrackIndex });
    }
    static getCurrentTrackTitle() {
        return this.playlist[PlayerState.currentTrackIndex].title;
    }
    static getNextTrack() {
        const nextIndex = (PlayerState.currentTrackIndex + 1) % this.playlist.length;
        return { track: this.playlist[nextIndex], index: nextIndex };
    }
    static getPreviousTrack() {
        const prevIndex = (PlayerState.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        return { track: this.playlist[prevIndex], index: prevIndex };
    }
    static #shuffleArray(array) {
        if (array.length == 1)
            return [...array];
        return [...array].reduce((_, cur, idx, arr) => {
            const rand = Math.floor(Math.random() * (idx + 1));
            [arr[idx], arr[rand]] = [arr[rand], cur];
            return arr;
        });
    }
}
