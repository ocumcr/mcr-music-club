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
        const form = document.querySelector<HTMLFormElement>(".search")!

        form.onsubmit = (e) => {
            e.preventDefault()

            URLManager.search(Header.search.value)
        }
    }

    static #setupTitle() {
        Header.title.onclick = (e) => {
            e.preventDefault()

            URLManager.search("")
        }
    }
}
