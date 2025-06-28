import { PlayerState } from "./PlayerState.js";
import { TrackElement, Footer } from "./UI.js";
// プレイリスト管理のクラス
export class PlaylistManager {
    static setPlaylist(playlist) {
        PlayerState.defaultOrderPlaylist = playlist;
        PlayerState.playlist = PlayerState.shuffleMode ? this.#shuffleArray(playlist) : playlist;
    }
    static setOrder() {
        const currentTrack = PlayerState.playlist[PlayerState.currentTrackIndex];
        PlayerState.currentTrackIndex = PlayerState.defaultOrderPlaylist.indexOf(currentTrack);
        PlayerState.playlist = [...PlayerState.defaultOrderPlaylist];
        TrackElement.renderMusicList(PlayerState.playlist);
        Footer.setPlayCount();
        Footer.setNowPlayingTrack({ index: PlayerState.currentTrackIndex });
        if (PlayerState.currentTrackIndex == 0) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        else {
            const track = document.querySelectorAll(".track")[PlayerState.currentTrackIndex - 1];
            track.scrollIntoView({
                behavior: "smooth",
            });
        }
    }
    static shufflePlaylist({ moveCurrentTrackToTop }) {
        const currentTrack = PlayerState.playlist[PlayerState.currentTrackIndex];
        // 今再生しているトラックを一番目に持ってくる
        do {
            PlayerState.playlist = this.#shuffleArray(PlayerState.playlist);
        } while (moveCurrentTrackToTop && PlayerState.playlist[0] != currentTrack);
        if (moveCurrentTrackToTop) {
            PlayerState.currentTrackIndex = 0;
        }
        TrackElement.renderMusicList(PlayerState.playlist);
        Footer.setPlayCount();
        Footer.setNowPlayingTrack({ index: PlayerState.currentTrackIndex });
        window.scrollTo({ top: 0, behavior: "smooth" });
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
    static getCurrentTrackTitle() {
        return PlayerState.playlist[PlayerState.currentTrackIndex].title;
    }
    static getNextTrack() {
        const nextIndex = (PlayerState.currentTrackIndex + 1) % PlayerState.playlist.length;
        return { track: PlayerState.playlist[nextIndex], index: nextIndex };
    }
    static getPreviousTrack() {
        const prevIndex = (PlayerState.currentTrackIndex - 1 + PlayerState.playlist.length) % PlayerState.playlist.length;
        return { track: PlayerState.playlist[prevIndex], index: prevIndex };
    }
}
