<template>
    <div class="sim-box-label">
        <sim-label
                @focus="focus = true"
                @blur="focus = false"
                :config="boxConfig">
            <slot></slot>
        </sim-label>
    </div>
</template>

<script>
    import SimLabel from './SimLabel.vue'
    export default {
        namme: "sim-box-label",
        props: ['config'],
        components: {
            SimLabel
        },
        computed: {
            boxConfig()
            {
                return Object.assign(this.config, {
                    required: true,
                    line: false,
                    scale: false,
                    labelOffset: {
                        top: 0,
                        left: 8
                    }
                })
            }
        }
    }
</script>

<style scoped lang="scss">
    .sim-box-label {
        .input__container {
            border-radius: 4px;
            box-shadow: 0 0 0 1px #d9d9d9;
            .slot-container {
                position: relative;
            }
            &.has-error {
                box-shadow: 0 0 0 1px #ff0000;
                &.input__container--focus {
                    box-shadow: 0 0 0 2px #ff0000;
                }
            }
            &.input__container--focus {
                box-shadow: 0 0 0 2px #5D7998;
            }
        }
    }
</style>