export class Header {
    static title: HTMLElement
    static searchBox: HTMLInputElement
    static searchForm: HTMLFormElement

    static init() {
        this.title = document.getElementById("title")!
        this.searchBox = document.getElementById("search-box") as HTMLInputElement
        this.searchForm = document.getElementById("search") as HTMLFormElement
    }

    static setSearchBox(text: string) {
        this.searchBox.value = text
    }
}
