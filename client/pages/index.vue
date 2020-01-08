<template>
    <section>
        <div style="text-align: center;">
            <div v-if="yearSelectHTML" style="display: inline-block;">
                <div style="display: flex;">
                    <div style="margin-right: 30px;">
                        <label for="minYear">Min Year<br></label>
                        <select v-html="yearSelectHTML" v-model="minYearSelected" @change="loadData()" id="minYear"/>
                    </div>
                    <div style="margin-left: 30px;">
                        <label for="maxYear">Max Year<br></label>
                        <select v-html="yearSelectHTML" v-model="maxYearSelected" @change="loadData()" id="maxYear"/>
                    </div>
                </div>
            </div>
            <div v-else style="text-align: left; font-size: 26px;">
                <p>Loading . . .</p>
            </div>
        </div>
        <br>

        <div style="box-shadow: 1px 1px 3px 1px #b7b7b7;">
            <sim-table
                       :config="tableConfig"
                       :data="tableData"
                       :height="tableAttribute.height"
                       :itemHeight="tableAttribute.itemHeight"
                       :minWidth="tableAttribute.minWidth"
                       :selectable="tableAttribute.selectable"
                       :enableExport="tableAttribute.enableExport"
                       :bordered="tableAttribute.bordered"
                       :hoverHighlight="tableAttribute.hoverHighlight"
                       :language="tableAttribute.language"
                       :sortParam="tableAttribute.sortParam"
                       font-size="14px"
            >
            </sim-table>
        </div>
    </section>
</template>

<script>
    import {mapActions, mapGetters} from 'vuex'
    import simTable from '../components/sim-table/SimTable'

    export default {
        data: function () {
            return {
                tableData: [],
                currentYear: String(new Date().getFullYear()),
                absoluteMinYear: "1950",
                minYearSelected: String(new Date().getFullYear()),
                maxYearSelected: String(new Date().getFullYear()),
                yearSelectHTML: "",

                tableConfig: [
                    {
                        prop: "year",
                        name: "Year",
                        searchable: true,
                        sortable: true,
                        width: 20
                    },
                    {
                        prop: "numberEnrolled",
                        name: "Number Enrolled",
                        searchable: true,
                        sortable: true,
                        isHidden: false,
                        alignItems: 'center',
                        width: 100
                    },
                ],

                tableAttribute: {
                    height: 450,
                    itemHeight: 30,
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
        mounted() {
            this.loadData()
        },
        methods: {
            ...mapActions ([
                'fetchEnrollmentByYear',
            ]),
            getYearOptions() {
                for (let i = Number(this.currentYear); i > Number(this.absoluteMinYear); i--) {
                    this.yearSelectHTML += `<option value="${i}">${i}</option>`
                }
            },
            sumNumberEnrolled(objArray) {
                let sum = 0
                objArray.forEach((obj) => {
                    sum += Number(obj.NUMBER_ENROLLED)
                })
                return sum
            },
            async getTableDataByYear() {
                console.log("Reached")
                let newArray = []
                for (let i = Number(this.maxYearSelected); i >= Number(this.minYearSelected); i--) {
                    let yearObj = {
                        year: null,
                        numberEnrolled: null,
                    }
                    yearObj.year = i
                    await this.fetchEnrollmentByYear(String(i))
                    yearObj.numberEnrolled = this.sumNumberEnrolled(this.getEnrollmentData[String(i)]) //Sum number for year
                    newArray.push(yearObj)
                    this.tableData = newArray
                }
            },
            loadData() {
                this.getYearOptions()
                this.getTableDataByYear()
            }
        }
    }
</script>

<style lang="stylus" scoped>

</style>
