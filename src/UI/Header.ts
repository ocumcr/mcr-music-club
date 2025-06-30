export class Header {
    static title: HTMLElement
    static search: HTMLInputElement

    static init() {
        this.title = document.getElementById("title")!
        this.search = document.getElementById("search") as HTMLInputElement
    }

    static setSearchBox(text: string) {
        this.search.value = text
    }
}
