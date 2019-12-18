<template>
    <section v-if="hasMessage">
        <div :style="color()" style="color: white;" class="message">
            <div style="padding-top: 13px; padding-left: 10px;"> {{hasMessage}} </div>
            <div class="exit" @click="nullify()"> X </div>
        </div>
        <br>
    </section>
</template>

<script>
    export default {
        name: "message",
        computed: {
            hasMessage() {
                return this.$store.state.hasMessage
            }
        },
        methods: {
            color() {
                let color
                if (this.hasMessage.includes("error")) {
                    color = '#A60317'
                }
                else {
                    color = '#37870B'
                }
                return 'background-color: ' + color
            },
            nullify() {
                this.$store.commit('setHasMessage', false)
            }
        }
    }
</script>

<style scoped>

    .message {
        height: 50px;
        margin-left: 100px;
        margin-right: 100px;
        display: flex;
    }

    .exit {
        padding-top: 13px;
        padding-left: 10px;
        position: absolute;
        right: 130px;
        font-weight: bold;
        cursor: pointer;
    }

</style>