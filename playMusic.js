const setButtons = () => {
    const playBtn = document.getElementById("playBtn")
    const pauseBtn = document.getElementById("pauseBtn")
    const seekBar = document.getElementById("seekBar")
    const currentTimeEl = document.getElementById("currentTime")
    const durationEl = document.getElementById("duration")
    const volumeControl = document.getElementById("volume")

    document.querySelectorAll(".img-box").forEach((b, i) => {
        b.addEventListener("click", () => {
            if (audio) audio.pause()

            audio = new Audio(data[i].path)

            audio.volume = volumeControl.value / 100

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
        })
    })

    // フォーマット時刻を表示 (mm:ss)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }

    // 再生ボタンの動作
    playBtn.addEventListener("click", () => {
        if (!audio) return
        audio.play()
    })

    // 一時停止ボタンの動作
    pauseBtn.addEventListener("click", () => {
        if (!audio) return

        audio.pause()
    })

    // シークバー操作時に再生位置を変更
    seekBar.addEventListener("input", () => {
        if (!audio) return

        audio.currentTime = seekBar.value
    })

    // 音量スライダー操作
    volumeControl.addEventListener("input", (e) => {
        if (!audio) return

        console.log(e.target.value / 100)

        const volume = e.target.value / 100
        audio.volume = volume
    })
}

window.addEventListener("DOMContentLoaded", async () => {
    await setMusics()
    setButtons()
})

let audio = null
