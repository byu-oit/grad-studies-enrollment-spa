<template>
    <section>
        <h2>
            Graduate Studies Enrollment
        </h2>
    </section>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'

    export default {
        data: function () {
            return {
                enrollmentData: null,
            }
        },
        computed: {
            ...mapGetters ([
                'getEnrollmentData',
            ])
        },
        mounted() {
            this.fetchEnrollmentByYear('2011')
            this.enrollmentData = this.getEnrollmentData
            console.log("Data", this.enrollmentData)
        },
        methods: {
            ...mapActions ([
                'fetchEnrollmentByYear',
            ]),
        }
    }
</script>

<style lang="stylus" scoped>

</style>
