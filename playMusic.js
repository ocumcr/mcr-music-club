const setButtons = (data) => {
    const playButton = document.getElementById("play-button")
    const seekBar = document.getElementById("seekBar")
    const currentTimeEl = document.getElementById("currentTime")
    const durationEl = document.getElementById("duration")
    const volumeControl = document.getElementById("volume")
    const musicTitle = document.getElementById("music-title")
    const miniThumbnail = document.getElementById("mini-thumbnail")
    const loopButton = document.getElementById("loop-button")
    const backButton = document.getElementById("back-button")
    const forwardButton = document.getElementById("forward-button")

    volumeControl.value = localStorage.getItem("volume") ?? 50
    loopMode = localStorage.getItem("loopMode") ?? 0

    loopButton.innerHTML = `
        <i class="fa-solid fa-repeat ${["loop-none", "", "loop-one"][loopMode]}"></i>
    `

    document.querySelectorAll(".img-box").forEach((b, i) => {
        b.addEventListener("click", () => {
            if (audio) audio.pause()

            audio = new Audio(data[i].path)

            audio.loop = loopMode == 2

            source = context.createMediaElementSource(audio)

            source.connect(gain)

            setAudio(i)

            playButton.innerHTML = `
                <i class="fa-solid fa-pause"></i>
            `
        })
    })

    const setAudio = (i) => {
        gain.gain.value = volumeControl.value / 100

        audio.onended = () => {
            if (loopMode == 1) {
                source.disconnect()

                audio = new Audio(data[(i + 1) % data.length].path)
                source = context.createMediaElementSource(audio)

                source.connect(gain)

                setAudio((i + 1) % data.length)
            } else if (loopMode == 0) {
                if (i + 1 != data.length) {
                    source.disconnect()

                    audio = new Audio(data[(i + 1) % data.length].path)
                    source = context.createMediaElementSource(audio)

                    source.connect(gain)

                    setAudio((i + 1) % data.length)
                } else {
                    playButton.innerHTML = `
                        <i class="fa-solid fa-play"></i>
                    `
                }
            }
        }

        backButton.onclick = (e) => {
            if (audio.currentTime < 1) {
                source.disconnect()

                audio = new Audio(data[(i + data.length - 1) % data.length].path)
                source = context.createMediaElementSource(audio)

                source.connect(gain)

                setAudio((i + data.length - 1) % data.length)
            } else {
                audio.currentTime = 0
            }
        }

        forwardButton.onclick = (e) => {
            source.disconnect()

            audio = new Audio(data[(i + 1) % data.length].path)
            source = context.createMediaElementSource(audio)

            source.connect(gain)

            setAudio((i + 1) % data.length)
        }

        musicTitle.innerHTML = data[i].title + "<br />" + data[i].author
        miniThumbnail.style.backgroundImage = `url(${data[i].thumbnail})`
        miniThumbnail.style.backgroundSize = "cover"

        // 再生中にシークバーを更新
        audio.addEventListener("timeupdate", () => {
            seekBar.value = audio.currentTime
            currentTimeEl.textContent = formatTime(audio.currentTime)
        })

        // 音楽ファイルの読み込み完了時に初期設定
        audio.addEventListener("loadedmetadata", () => {
            seekBar.max = audio.duration
            durationEl.textContent = formatTime(audio.duration)

            audio.play()
        })
    }

    // フォーマット時刻を表示 (mm:ss)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }

    // 再生ボタンの動作
    playButton.addEventListener("click", (e) => {
        if (!audio) return
        if (audio.paused) {
            audio.play()
            playButton.innerHTML = `
                <i class="fa-solid fa-pause"></i>
            `
        } else {
            audio.pause()
            playButton.innerHTML = `
                <i class="fa-solid fa-play"></i>
            `
        }
    })

    // ループボタン
    loopButton.addEventListener("click", (e) => {
        loopMode++
        loopMode %= 3

        audio.loop = loopMode == 2

        loopButton.innerHTML = `
            <i class="fa-solid fa-repeat ${["loop-none", "", "loop-one"][loopMode]}"></i>
        `

        localStorage.setItem("loopMode", loopMode)
    })

    window.addEventListener("keydown", (e) => {
        if (e.code == "Space") {
            e.preventDefault()
            if (!audio) return
            if (audio.paused) {
                audio.play()
                playButton.innerHTML = `
                    <i class="fa-solid fa-pause"></i>
                `
            } else {
                audio.pause()
                playButton.innerHTML = `
                    <i class="fa-solid fa-play"></i>
                `
            }
        }
    })

    // シークバー操作時に再生位置を変更
    seekBar.addEventListener("input", () => {
        if (!audio) return

        audio.currentTime = seekBar.value
    })

    // 音量スライダー操作
    volumeControl.addEventListener("input", (e) => {
        localStorage.setItem("volume", e.target.value)

        if (!audio) return

        const volume = e.target.value / 100
        gain.gain.value = volume
    })
}

const setMusics = (data) => {
    const ol = document.querySelector(".musics")

    data.forEach((obj) => {
        let tags = ""

        obj.tags.forEach((tag) => {
            tags += `
                <button class="tag-button" onclick="onClickTag('${tag}')">#${tag}</button>
            `
        })

        ol.innerHTML += `
             <li>
                <div class="img-box" style="
                    background: url(${obj.thumbnail});
                    background-size: cover;
                "></div>
                <div class="description">
                    <h3>${obj.title}</h3>
                    <p>${obj.year}年</p>
                    <p onclick="onClickTag('${obj.author}')" class="author">${obj.author}</p>
                    <p>${obj.description}</p>
                    <div class="tags">
                        ${tags}
                    </div>
                </div>
               
            </li>
        `
    })
}

const onClickTag = (tag) => {
    const url = new URL(location.href)
    url.searchParams.set("search", tag)

    location.href = url.href
}

window.addEventListener("DOMContentLoaded", async () => {
    // json取得
    const json = await fetch("music-data.json")
    const data = await json.json()

    // urlの検索を取得
    const url = new URL(location.href)
    const search = url.searchParams.get("search")

    const searchIsValid = search != "" && search != null
    if (searchIsValid) {
        // 検索結果にヒットするものをとる
        data = data.filter((m) => m.tags.includes(search) || m.title.includes(search) || m.author == search)
    }

    // 表示
    setMusics(data)

    // 再生設定
    setButtons(data)

    document.getElementById("title").addEventListener("click", (e) => {
        e.preventDefault()
        window.location.href = window.location.origin + window.location.pathname + "?search="
    })
})

let loopMode = 0

let audio = null
let source = null
const context = new AudioContext()
const gain = context.createGain()
gain.connect(context.destination)
