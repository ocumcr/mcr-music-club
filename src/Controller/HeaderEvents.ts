import { Header } from "../View/Header.js"
import { URLManager } from "./URLManager.js"

export class HeaderEvents {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#setupForm()
        this.#setupTitle()

        this.#initialized = true
    }

    static #setupForm() {
        Header.searchForm.onsubmit = (e) => {
            e.preventDefault()

            URLManager.search(Header.searchBox.value)
        }
    }

    static #setupTitle() {
        Header.title.onclick = (e) => {
            e.preventDefault()

            URLManager.search("")
        }
    }
}
