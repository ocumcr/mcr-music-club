// 再生回数を送る
export const sendPlayCount = async (title: string) => {
    return

    try {
        const response = await fetch(
            "https://script.google.com/macros/s/AKfycbya_x47m1TS70IhvejTmlMscmsGtheak2MvwYuXvVMse-Ar6UDv1EqmG_aQTSmDxRWc/exec",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title,
                }),
                mode: "no-cors",
            },
        )

        // console.log(response)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log(result.status === "success" ? "送信完了！" : "エラーが発生しました。")
    } catch (error) {
        console.error("Error:", error)
        console.log("送信中にエラーが発生しました。")
    }
}

export const fetchPlayCountData = async () => {
    const response = await fetch(
        "https://script.google.com/macros/s/AKfycbw-M6WdDND050H_DboJKixnDERBEYu1X24O6JthlZkohDJMKfrELuQ5YHDpbZ8N3eOh/exec",
    ) // WebアプリURLを指定

    const data = await response.json() // JSONデータとして解析

    return data
}
