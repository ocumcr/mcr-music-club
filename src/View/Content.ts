export class Content {
    static debugLog: HTMLElement
    static content: HTMLElement
    static #musics: HTMLOListElement

    static init() {
        this.debugLog = document.getElementById("debug-log")!
        this.content = document.querySelector(".content")!
        this.#musics = document.getElementById("musics") as HTMLOListElement
    }

    static addLog(text: string) {
        console.log(text)
        // document.getElementById("debug-log").innerHTML += navigator.mediaSession.playbackState + "<br />"
        this.debugLog.innerHTML += text + "<br />"
    }

    static fadeIn() {
        this.content.classList.remove("fade-in")
        requestAnimationFrame(() => {
            this.content.classList.add("fade-in")
        })
    }

    static scrollTo(index: number) {
        if (index <= 0) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        } else {
            const track = document.querySelectorAll(".track")[index - 1]

            track.scrollIntoView({
                behavior: "smooth",
            })
        }
    }

    static renderPlaylist(playlist: readonly Track[]) {
        this.#musics.innerHTML = playlist.map(this.#createTrackElement).join("")
    }

    static #createTrackElement(track: Track) {
        const tags = track.tags.map((tag) => `<button class="tag-button">#${tag}</button>`).join("")

        return `
            <li class="track" data-state="pause">
                <div class="img-box" style="
                    background: url(${track.thumbnail});
                    background-size: cover;
                ">
                    <i class="fa-solid fa-circle-play"></i>
                    <i class="fa-solid fa-circle-pause"></i>
                    <i class="fa-solid fa-spinner"></i>
                </div>
                <div class="description">
                    <h3>${track.title}</h3>
                    <p>${track.year}</p>
                    <p class="author">${track.author}</p>
                    <p>${track.description}</p>
                    <div class="tags">
                        ${tags}
                    </div>
                </div>
                <div class="play-count">取得中...</div>
            </li>
        `
    }

    static setPlayCount(playlist: readonly Track[], playCountRecord: PlayCountRecord) {
        const list = document.querySelectorAll<HTMLElement>(".play-count")

        playlist.forEach((obj, i) => {
            list[i].innerText = "再生回数: " + (playCountRecord[obj.title] ?? 0)
        })
    }

    static updatePlayingClass(index: number) {
        this.#musics.querySelectorAll<HTMLElement>(".track").forEach((track, i) => {
            track.dataset["state"] = i === index ? "playing" : "pause"
        })
    }

    static setLoading(index: number) {
        const track = this.#musics.querySelectorAll<HTMLElement>(".track")[index]

        if (track) {
            track.dataset["state"] = "loading"
        }
    }
}
