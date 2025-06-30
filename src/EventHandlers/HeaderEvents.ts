import { handleQueryChange } from "../playMusic.js"
import { Header } from "../UI/Header.js"
import { URLManager } from "../URLManager.js"

export class HeaderEvents {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#setupForm()
        this.#setupTitle()

        this.#initialized = true
    }

    static #setupForm() {
        const form = document.querySelector<HTMLFormElement>(".search")!

        form.onsubmit = (e) => {
            e.preventDefault()
            URLManager.setSearchQuery(Header.search.value)
            handleQueryChange()
        }
    }

    static #setupTitle() {
        Header.title.addEventListener("click", (e) => {
            e.preventDefault()

            URLManager.clearSearchQuery()

            handleQueryChange()
        })
    }
}
