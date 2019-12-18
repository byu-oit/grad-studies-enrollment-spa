import Vue from 'vue'
import FullLoading from 'vue-full-loading'

export default function({ app }) {
    Vue.use({
        install: function (Vue) {
            Vue.component('loading', FullLoading)
        }
    })
}