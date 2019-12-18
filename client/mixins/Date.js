export default {
    data() {
        return {
            shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            fullMonths: ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        }
    },
    methods: {
        _date_formatDDMONYEAR(val) {
            const date = new Date(val)
            let fullMonths = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

            return date.getDate() + " " + fullMonths[date.getMonth()] + " " + date.getFullYear()
        }
    }
}