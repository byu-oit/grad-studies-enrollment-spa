import Vue from 'vue'
import Vcalendar from 'client/plugins/v-calendar'
// import 'v-calendar/lib/v-calendar.min.css'

Vue.use(Vcalendar, {             // second is optional
    datePickerTintColor: '#F00',
    datePickerShowDayPopover: false
})