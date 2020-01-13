<template>
    <section>
        <div style="text-align: center;">
            <div v-if="yearSelectHTML" style="display: inline-block;">
                <div style="font-size: 32px;">Years</div>
                <div style="display: flex;">
                    <div style="margin-right: 10px;">
                        <label for="minYear"/>
                        <select v-html="yearSelectHTML" v-model="minYearSelected" @change="loadData()" id="minYear"/>
                    </div>
                    &ndash;
                    <div style="margin-left: 10px;">
                        <label for="maxYear"/>
                        <select v-html="yearSelectHTML" v-model="maxYearSelected" @change="loadData()" id="maxYear"/>
                    </div>
                </div>
            </div>
            <div v-else style="text-align: left; font-size: 26px;">
                <p>Loading . . .</p>
            </div>
        </div>
        <div style="float: left; margin: -25px 0 0 8%;">
            <button @click="toggle" style="font-size: 20px;">{{sortButtonText}}</button>
        </div>
        <br>
        <div v-if="tableData" style="box-shadow: 1px 1px 3px 1px #b7b7b7;">
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
                       font-size="18px"
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
                enrollmentData: {},
                tableData: [],
                currentYear: String(new Date().getFullYear()),
                minYearSelected: String(new Date().getFullYear()),
                maxYearSelected: String(new Date().getFullYear()),
                yearSelectHTML: "",

                //Table Configuration
                sortButtonText: "",
                tableConfig: [],
                tableAttribute: {
                    height: 440,
                    itemHeight: 30,
                    minWidth: 40,
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
                'getAbsoluteMinYear',
            ])
        },
        components: {
            simTable,
        },
        mounted() {
            this.getYearOptions()
            this.loadData()
        },
        methods: {
            ...mapActions ([
                'fetchEnrollmentByYear',
            ]),
            getYearOptions() {
                const absoluteMinYear = this.getAbsoluteMinYear
                for (let i = Number(this.currentYear); i >= Number(absoluteMinYear); i--) {
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
            async loadAllEnrollmentData() {
                const absoluteMinYear = this.getAbsoluteMinYear
                for (let i = Number(this.currentYear); i >= Number(absoluteMinYear); i--) {
                    try {
                        await this.fetchEnrollmentByYear(String(i))
                        this.enrollmentData[String(i)] = this.getEnrollmentData[String(i)]
                    } catch(e) {
                        console.error("ERROR:", e)
                        break
                    }
                }
            },
            async getTableDataByYear() {
                let newArray = []
                for (let i = Number(this.maxYearSelected); i >= Number(this.minYearSelected); i--) {
                    let yearObj = {
                        year: null,
                        numberEnrolled: null,
                    }
                    try {
                        await this.fetchEnrollmentByYear(String(i))
                        yearObj.year = i
                        yearObj.numberEnrolled = this.sumNumberEnrolled(this.getEnrollmentData[String(i)]) //Sum number for year
                        newArray.push(yearObj)
                        this.tableData = newArray
                    } catch(e) {
                        console.error("ERROR:", e)
                        break
                    }
                }
            },
            async getTableDataByCollege() {
                this.tableData = []
                for (let i = Number(this.maxYearSelected); i >= Number(this.minYearSelected); i--) {
                    try {
                        await this.fetchEnrollmentByYear(String(i))
                        let yearArray = this.getEnrollmentData[String(i)]
                        let tempArray = []
                        yearArray.forEach((obj) => {
                            let collegeObj = {
                                year: i,
                                numberEnrolled: null,
                                name: null,
                            }
                            collegeObj.name = obj.LEVEL_2_NAME
                            collegeObj.numberEnrolled = obj.NUMBER_ENROLLED

                            tempArray.push(collegeObj)
                        })
                        this.tableData = this.tableData.concat(tempArray)
                    } catch(e) {
                        console.error("ERROR:", e)
                        break
                    }
                }
            },
            loadData() {
                this.loadAllEnrollmentData()
                this.configureTable()
                if (this.sortByCollege) {
                    this.getTableDataByCollege()
                }
                else {
                    this.getTableDataByYear()
                }
            },
            toggle() {
                this.sortByCollege = !this.sortByCollege
                this.loadData()
            },
            findPropertyValue(objectArray, property, value) {
                for (let i = 0; i < objectArray.length; i++) {
                    if (objectArray[i][property] === value) {
                        return i
                    }
                }
                return false
            },
            configureTable() {
                if (this.sortByCollege) {
                    this.sortButtonText = "Sort by Year"
                    this.tableConfig = [
                        {
                            prop: "name",
                            name: "College",
                            searchable: true,
                            sortable: true,
                            width: 20
                        },
                        {
                            prop: "numberEnrolled",
                            name: `Total Enrolled in ${this.minYearSelected} through ${this.maxYearSelected}`,
                            searchable: true,
                            sortable: true,
                            isHidden: false,
                            alignItems: 'center',
                            width: 10
                        },
                    ]
                } else {
                    this.sortButtonText = "Sort by College"
                    this.tableConfig = [
                        {
                            prop: "year",
                            name: "Year",
                            searchable: true,
                            sortable: true,
                            width: 20
                        },
                        {
                            prop: "numberEnrolled",
                            name: "Total Enrolled at BYU",
                            searchable: true,
                            sortable: true,
                            isHidden: false,
                            alignItems: 'center',
                            width: 10
                        },
                    ]
                }
            }
        }
    }
</script>

<style lang="stylus" scoped>

</style>
