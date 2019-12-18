<template>
    <div>
        <div class = row h-25 style="margin-left: 6px">
            <label class="col-form-label-sm label">{{ label }}</label>
        </div>
        <div class = row h-100 style="margin-left: 4px">
            <select
                    v-if="!readOnly"
                    v-model="selectedOption"
                    :class="applyClass"
                    :style="theStyle"
                    type="text"
                    @input="event => { $emit('input', event.target.value) }"
                    :disabled="readOnly"
                    :required="required"
            >       :readonly="readOnly"
                <option v-for="item in items">{{ item }}</option>
            </select>
            <select
                    v-else
                    :class="applyClass"
                    :style="theStyle"
                    ref="readOnly"
                    v-model="value"
                    disabled
                    readonly
                    :required="required"
            >
                <option v-for="item in items">{{ item }}</option>

            </select>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'SimSelect',
        props: {
            /* value is the v-model value */
            value: {
                type: String,
                required: false
            },
            label: {
                type: String,
                required: true
            },
            /**
             * This will set the width of the label
             */
            width: {
                type: String,
                default: '150px',
                required: false
            },
            /**
             * This will set the class of the select object
             */
            applyClass: {
                type: String,
                default: 'form-control-sm',
                required: false
            },
            items: {
                type: Array,
                default: [],
                required: false
            },
            /* If border is true a 1px black border will be displayed */
            border: {
                type: Boolean,
                default: false
            },
            /**
             * Hide input and show value in text only.
             */
            readOnly: {
                type: Boolean,
                default: false,
                required: false
            },
            required: {
                type: Boolean,
                default: false
            },
            position: {
                type: String,
                default: 'left'
            }
        },
        data: () => ({
            selectedOption: null
        }),
        computed: {
            theStyle() {
                let style = '';
                if (this.border) {
                    style = 'border: solid black 1px;'
                }
                if (this.width !== '') {
                    style += 'width: ' + this.width
                }

                if (this.position === 'center') {
                    style = style + 'text-align: center;'
                }
                else if (this.position === 'right') {
                    style = style + 'text-align: right;'
                }
                else {
                    style = style + 'text-align: left;'
                }

                if (this.required) {
                    style += 'required;'
                }

                return style
            },

            theValue() {
                return this.value
            }
        },
        watch: {
            value: function (newValue) {
                this.selectedOption = newValue
            }
        },
        mounted() {
            this.selectedOption = this.value
        },
        methods: {
        }
    }
</script>
<style scoped lang="styl">
    label {
        text-align: left;
        padding-left: 8px;
        margin-bottom: -8px;
        clear: left;
    }
    select {
        float: left;
        background-color: white;
        font-size: 14px;
        border-radius: 4px;
        height: 35px;
        text-align: center;
        text-align-last: center;
    }
    option {
        text-align: center;
        /* reset to left*/
    }

    select:focus {
        text-decoration: underline;
    }
    select:disabled {
        background-color:#eff1f4;
        margin-left:10px;
        color: black
    }
</style>
