<template>
    <section>
        <h2>
            Graduate Studies Enrollment
        </h2>
    </section>
</template>

<script>
    import {mapGetters, mapActions, mapMutations} from 'vuex'

    export default {
        data: function () {
            return {
            }
        },
        computed: {
            ...mapGetters ([
                'getEnrollmentData',
            ])
        },
        mounted() {
            this.func()
        },
        methods: {
            ...mapActions ([
                'fetchEnrollmentByYear',
            ]),

            func() {
                this.fetchEnrollmentByYear('2011')
            }
        }
    }
</script>

<style lang="stylus" scoped>

</style>
