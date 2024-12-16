let data

const setMusics = async () => {
    const ol = document.querySelector(".musics")

    const json = await fetch("music-data.json")
    data = await json.json()

    data.forEach((obj) => {
        ol.innerHTML += `
             <li>
                <div class="img-box"></div>
                <div class="description">
                    <p>${obj.title}</p>
                    <p>${obj.year}年</p>
                    <p>${obj.author}</p>
                    <p>${obj.description}</p>
                </div>
            </li>
        `
    })
}
