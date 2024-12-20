const setButtons = (data) => {
    const playButton = document.getElementById("play-button")
    const seekBar = document.getElementById("seekBar")
    const currentTimeEl = document.getElementById("currentTime")
    const durationEl = document.getElementById("duration")
    const volumeControl = document.getElementById("volume")
    const musicTitle = document.getElementById("music-title")
    const miniThumbnail = document.getElementById("mini-thumbnail")

    const loopButton = document.getElementById("loop-button")
    const shuffleButton = document.getElementById("shuffle-button")

    const backButton = document.getElementById("back-button")
    const forwardButton = document.getElementById("forward-button")

    volumeControl.value = localStorage.getItem("volume") ?? 50

    loopButton.innerHTML = `
        <i class="fa-solid fa-repeat ${["loop-none", "", "loop-one"][loopMode]}"></i>
    `
    loopButton.title = ["ループしない", "ループする", "一曲ループ"][loopMode]

    shuffleButton.style.opacity = ["0.5", "1"][shuffleMode]

    const setAudio = (i) => {
        safeSendPlayCount(data[i].title)

        gain.gain.value = volumeControl.value / 100

        audio.onended = () => {
            if (loopMode == 1) {
                if (i + 1 == data.length) {
                    data = shuffleArray(data)
                    setMusics(data)
                    setImgBoxAction(data, setAudio, playButton)
                }

                source.disconnect()

                audio = new Audio(data[(i + 1) % data.length].path)
                source = context.createMediaElementSource(audio)

                source.connect(gain)

                setAudio((i + 1) % data.length)
            } else if (loopMode == 0) {
                if (i + 1 < data.length) {
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

            // ループ再生を検知
            if (loopMode == 2 && audio.duration - audio.currentTime < 0.65) {
                safeSendPlayCount(data[i].title)
            }

            console.log()

            // if(loopMode==2 && seekBar.value)
        })

        // 音楽ファイルの読み込み完了時に初期設定
        audio.addEventListener("loadedmetadata", () => {
            seekBar.max = audio.duration
            durationEl.textContent = formatTime(audio.duration)

            audio.play()
        })
    }

    setImgBoxAction(data, setAudio, playButton)

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

        loopButton.innerHTML = `
            <i class="fa-solid fa-repeat ${["loop-none", "", "loop-one"][loopMode]}"></i>
        `

        loopButton.title = ["ループしない", "ループする", "一曲ループ"][loopMode]

        localStorage.setItem("loopMode", loopMode)

        if (!audio) return

        audio.loop = loopMode == 2
    })

    // ループボタン
    shuffleButton.addEventListener("click", (e) => {
        shuffleMode = 1 - shuffleMode
        shuffleButton.style.opacity = ["0.5", "1"][shuffleMode]
        localStorage.setItem("shuffleMode", shuffleMode)
        console.log(shuffleMode)
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

const setImgBoxAction = (data, setAudio, playButton) => {
    document.querySelectorAll(".img-box").forEach((b, i) => {
        b.addEventListener("click", () => {
            if (audio) audio.pause()

            if (context == null) {
                context = new AudioContext()
                gain = context.createGain()
                gain.connect(context.destination)
            }

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
}

// 音声正規化の基本構造
async function normalizeAudio(context, audioBuffer, targetRMS = 0.1) {
    // 1. 音声データを解析
    const channelData = audioBuffer.getChannelData(0) // 左チャンネルのみ分析
    let sum = 0
    for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] ** 2 // 平方和を計算
    }
    const rms = Math.sqrt(sum / channelData.length) // RMSを計算

    // 2. ゲインを計算
    const gain = targetRMS / rms

    // 3. GainNodeを使って音量を調整
    const gainNode = context.createGain()
    gainNode.gain.value = gain

    // 4. AudioBufferSourceNodeを作成してGainNodeに接続
    const source = context.createBufferSource()
    source.buffer = audioBuffer
    source.connect(gainNode).connect(context.destination)

    return { source, gainNode }
}

const safeSendPlayCount = (title) => {
    if (!playCounted) {
        sendPlayCount(title)
        playCounted = true
        setTimeout(() => {
            playCounted = false
        }, 1000)
    }
}

const setMusics = (data) => {
    const ol = document.querySelector(".musics")

    ol.innerHTML = ""

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
                    <p>
                        ${obj.year}年
                    </p>
                    <p onclick="onClickTag('${obj.author}')" class="author">${obj.author}</p>
                    <p>${obj.description}</p>
                    <div class="tags">
                        ${tags}
                    </div>
                </div>

                <div class="play-count">取得中...</div>
            </li>
        `
    })
}

const onClickTag = (tag) => {
    const url = new URL(location.href)
    url.searchParams.set("search", tag)

    location.href = url.href
}

const setPlayCount = (data, record) => {
    const list = document.querySelectorAll(".play-count")

    data.forEach((obj, i) => {
        list[i].innerText = "再生回数: " + (record[obj.title] ?? 0)
    })
}

// reduceを用いた実装方法
const shuffleArray = (array) => {
    const cloneArray = [...array]

    const result = cloneArray.reduce((_, cur, idx) => {
        const rand = Math.floor(Math.random() * (idx + 1))
        cloneArray[idx] = cloneArray[rand]
        cloneArray[rand] = cur
        return cloneArray
    })

    return result
}

let playCounted = false

const fd = fetchData()

let loopMode = 0
let shuffleMode = 0

let audio = null
let source = null
let context = null
let gain = null

window.addEventListener("DOMContentLoaded", async () => {
    loopMode = localStorage.getItem("loopMode") ?? 0
    shuffleMode = localStorage.getItem("shuffleMode") ?? 0

    // json取得
    const json = await fetch("music-data.json")
    let data = await json.json()

    // urlの検索を取得
    const url = new URL(location.href)
    const search = url.searchParams.get("search")

    const searchIsValid = search != "" && search != null
    if (searchIsValid) {
        // 検索結果にヒットするものをとる
        data = data.filter((m) => m.tags.includes(search) || m.title.includes(search) || m.author == search)
    }

    if (shuffleMode == 1) {
        data = shuffleArray(data)
    }

    // 表示
    setMusics(data)

    // 再生設定
    setButtons(data)

    document.getElementById("title").addEventListener("click", (e) => {
        e.preventDefault()
        window.location.href = window.location.origin + window.location.pathname
    })

    const record = await fd

    setPlayCount(data, record)
})
