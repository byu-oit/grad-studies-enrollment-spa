import SimLabelVue from './SimLabel.vue'

const SimLabel = {
    install(Vue, _)
    {
        Vue.component(SimLabelVue.name, SimLabelVue)
    }
}

if (typeof window !== 'undefined' && window.Vue)
{
    window.Vue.use(SimLabel)
}

export default SimLabel
