export default {
    methods: {
        _sizeTable() {
            if (process.client) {
                const footerElem = document.getElementById("byu-footer")
                var rect = footerElem.getBoundingClientRect();
                const elem = document.getElementById("page-content")
                var rect2 = elem.getBoundingClientRect();
                return rect.top - (rect2.top + 80)
            }
            return 0
        }
    }
}