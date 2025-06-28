import { EventHandlers } from "./EventHandler.js";
import { LocalStorage } from "./LocalStorage.js";
import { PlayerState } from "./PlayerState.js";
import { formatTime } from "./playMusic.js";
// UIコントロール要素の参照
export class Footer {
    static elements;
    static init() {
        this.elements = {
            playButton: document.getElementById("play-button"),
            seekBar: document.getElementById("seekBar"),
            currentTimeEl: document.getElementById("currentTime"),
            durationEl: document.getElementById("duration"),
            volumeControl: document.getElementById("volume"),
            musicTitle: document.getElementById("music-title"),
            miniThumbnail: document.getElementById("mini-thumbnail"),
            loopButton: document.getElementById("loop-button"),
            shuffleButton: document.getElementById("shuffle-button"),
            backButton: document.getElementById("back-button"),
            forwardButton: document.getElementById("forward-button"),
        };
        this.#initializeVolume();
        this.updateLoopButtonUI();
        this.updateShuffleButtonUI();
    }
    static #initializeVolume() {
        this.elements.volumeControl.value = "" + LocalStorage.volume;
    }
    static updateLoopButtonUI() {
        const loopStates = ["loop-none", "", "loop-one"];
        const loopTitles = ["ループしない", "ループする", "一曲ループ"];
        this.elements.loopButton.innerHTML = `
            <i class="fa-solid fa-repeat ${loopStates[PlayerState.loopMode]}"></i>
        `;
        this.elements.loopButton.title = loopTitles[PlayerState.loopMode];
    }
    static updateShuffleButtonUI() {
        this.elements.shuffleButton.innerHTML = `
            <i class="fa-solid fa-shuffle ${["shuffle-off", ""][PlayerState.shuffleMode]}"></i>
        `;
    }
    static updatePlayButtonUI(isPlaying) {
        this.elements.playButton.innerHTML = `
            <i class="fa-solid fa-${isPlaying ? "pause" : "play"}"></i>
        `;
    }
    static updateTrackInfo(track) {
        this.elements.musicTitle.innerHTML = `${track.title}<br />${track.author}`;
        this.elements.miniThumbnail.style.backgroundImage = `url(${track.thumbnail})`;
        this.elements.miniThumbnail.style.backgroundSize = "cover";
    }
    static updateDurationUI(formattedTime) {
        this.elements.durationEl.innerText = formattedTime;
    }
    static updateSeekBarMax(max) {
        this.elements.seekBar.max = String(max);
    }
    static updateSeekBarAndCurrentTimeUI(time) {
        this.elements.currentTimeEl.innerText = formatTime(time);
        this.elements.seekBar.value = String(time);
    }
    static setPlayCount() {
        const list = document.querySelectorAll(".play-count");
        if (!PlayerState.record)
            return;
        PlayerState.playlist.forEach((obj, i) => {
            list[i].innerText = "再生回数: " + (PlayerState.record[obj.title] ?? 0);
        });
    }
    static removeNowPlayingTrack() {
        const nowPlayingTrack = document.querySelector(".playing");
        if (nowPlayingTrack) {
            nowPlayingTrack.classList.remove("playing");
        }
    }
    static setNowPlayingTrack({ index }) {
        const tracks = document.querySelectorAll(".track h3");
        if (tracks[index]) {
            tracks[index].classList.add("playing");
        }
    }
}
export class Header {
    static title;
    static debugLog;
    static #search;
    static init() {
        this.title = document.getElementById("title");
        this.debugLog = document.getElementById("debug-log");
        this.#search = document.getElementById("search");
    }
    static setSearchBox(text) {
        this.#search.value = text;
    }
}
export class TrackElement {
    static renderMusicList(data) {
        const ol = document.querySelector(".musics");
        const createTrackElement = (track, index) => `
            <li class="track">
                <div class="img-box" style="
                    background: url(${track.thumbnail});
                    background-size: cover;
                "></div>
                <div class="description">
                    <h3>${track.title}</h3>
                    <p>${track.year}</p>
                    <p onclick="onClickTag('${track.author}')" class="author">${track.author}</p>
                    <p>${track.description}</p>
                    <div class="tags">
                        ${track.tags
            .map((tag) => `
                                    <button class="tag-button" onclick="onClickTag('${tag}')">#${tag}</button>
                                `)
            .join("")}
                    </div>
                </div>
                <div class="play-count">取得中...</div>
            </li>
        `;
        ol.innerHTML = data.map(createTrackElement).join("");
        // 各トラックのクリックイベントを設定
        document.querySelectorAll(".img-box").forEach((box, index) => {
            box.addEventListener("click", async () => {
                await EventHandlers.changeTrack(data[index], index);
            });
        });
    }
}
