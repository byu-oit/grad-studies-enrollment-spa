<template>
    <section>
        <h2>
            Graduate Studies Enrollment
        </h2>
        <sim-table v-if="enrollmentData"
                   :config="tableConfig"
                   :data="enrollmentData['2011']"
                   :height="tableAttribute.height"
                   :itemHeight="tableAttribute.itemHeight"
                   :minWidth="tableAttribute.minWidth"
                   :selectable="tableAttribute.selectable"
                   :enableExport="tableAttribute.enableExport"
                   :bordered="tableAttribute.bordered"
                   :hoverHighlight="tableAttribute.hoverHighlight"
                   :language="tableAttribute.language"
                   :sortParam="tableAttribute.sortParam"
                   height="100%"
                   font-size="14px"
        >
        </sim-table>
        <div v-if="enrollmentData">
            Enrolled: {{enrollmentData['2011'][0].NUMBER_ENROLLED}}
        </div>
    </section>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import simTable from '../components/sim-table/SimTable'

    export default {
        data: function () {
            return {
                enrollmentData: null,

                tableConfig: [
                    {
                        prop: "NUMBER_ENROLLED",
                        name: "Name",
                        searchable: true,
                        sortable: true,
                        isHidden: false,
                        summary: "COUNT",
                        alignItems: 'left',
                        width: 250
                    },
                    {
                        prop: "DEGREE",
                        name: "Degree",
                        searchable: true,
                        sortable: true,
                        width: 100
                    },
                    {
                        prop: "LEVEL_2_NAME",
                        name: "College",
                        searchable: true,
                        sortable: true,
                        alignItems: 'center',
                        width: 250
                    },
                ],

                tableAttribute: {
                    height: 665,
                    itemHeight: 35,
                    minWidth: 1000,
                    selectable: true,
                    enableExport: false,
                    bordered: true,
                    hoverHighlight: true,
                    language: "en",
                    sortParam: { col: "sortName", direction: "asc" }
                },
            }
        },
        computed: {
            ...mapGetters ([
                'getEnrollmentData',
            ])
        },
        components: {
            simTable,
        },
        async mounted() {
            await this.fetchEnrollmentByYear('2011')
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
