<template>
    <section>
        <div v-if="loading" style="z-index: 10; position: absolute; padding: 15px; background-color: #ededed; border-radius: 15px; display: flex;">
            <div style="margin: 5px 10px 0 0;">Loading years...</div>
            <img src="../assets/images/loading.gif" height="32" alt="Loading...">
        </div>
        <div style="text-align: center;">
            <div style="margin: 0 25% 0 25%;">
                <div style="float: left;">
                    Sort<br>
                    <select v-model="sortVal" @change="loadTable" id="sortVal" style="font-size: 14px; margin-top: 5px;">
                        <option value="college">College</option>
                        <option value="year">Year</option>
                        <option value="program">Program</option>
                    </select>
                </div>
                <div style="float: right;">
                    Years
                    <div style="display: flex; margin-top: 5px;">
                        <div style="margin-right: 10px;">
                            <label for="minYear"/>
                            <select v-html="yearSelectHTML" v-model="minYearSelected" @change="loadTable" id="minYear" :style="dropdownStyle"/>
                        </div>
                        &ndash;
                        <div style="margin-left: 10px;">
                            <label for="maxYear"/>
                            <select v-html="yearSelectHTML" v-model="maxYearSelected" @change="loadTable" id="maxYear" :style="dropdownStyle"/>
                        </div>
                    </div>
                    <div style="margin-top: 5px; font-size: 14px; color: red; position: absolute; margin-left: -40px;">{{dropdownError}}</div>
                </div>
            </div>
        </div>
        <br>
        <div style="box-shadow: 1px 1px 3px 1px #b7b7b7; margin-top: 60px;">
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
                enrollmentData: null,
                tableData: [],
                loading: false,
                currentYear: String(new Date().getFullYear()),
                minYearSelected: String(new Date().getFullYear()),
                maxYearSelected: String(new Date().getFullYear()),
                yearSelectHTML: "",
                sortVal: "college", //OPTIONS: college, year, program, department
                dropdownError: null,

                //Table Configuration
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
            ]),
            dropdownStyle: function() {
                let style = 'font-size: 14px; '
                if (this.minYearSelected > this.maxYearSelected) {
                    style += 'box-shadow: 0 0 3px red;'
                    this.dropdownError = "The greater year must be on the right."
                }
                else {
                    this.dropdownError = null
                }
                return style
            }
        },
        components: {
            simTable,
        },
        async mounted() {
            this.getAllYears()
            this.getYearOptions()
            this.configureTable()
            await this.getCurrentYear()
        },
        methods: {
            ...mapActions ([
                'fetchEnrollmentByYear',
            ]),
            async getCurrentYear() {
                this.loading = true
                await this.fetchEnrollmentByYear(String(this.currentYear))
                let data = this.deepCopy(this.getEnrollmentData[String(this.currentYear)])
                data.forEach((obj) => {
                    let foundMatch = false
                    this.tableData.forEach((tableObj) => {
                        if (tableObj.LEVEL_2_NAME === obj.LEVEL_2_NAME) {
                            tableObj.NUMBER_ENROLLED = String(Number(tableObj.NUMBER_ENROLLED) + Number(obj.NUMBER_ENROLLED))
                            foundMatch = true
                        }
                    })
                    if (!foundMatch) {
                        this.tableData.push(obj)
                    }
                })
                this.tableData.sort((a,b) => {return a.LEVEL_2_NAME > b.LEVEL_2_NAME ? 1 : -1})
                this.loading = false
            },
            async getAllYears() {
                const absoluteMinYear = this.getAbsoluteMinYear
                let params = ""
                for (let i = Number(this.currentYear); i >= Number(absoluteMinYear); i--) {
                    params += String(i) + "/"
                }
                await this.fetchEnrollmentByYear(params)
                this.enrollmentData = this.deepCopy(this.getEnrollmentData)
                const keys = Object.keys(this.enrollmentData)
                keys.forEach((key) => {
                    this.enrollmentData[key].forEach((obj) => {
                        obj.YEAR = key
                    })
                })
            },
            sortTable() {
                let sortProp = null
                switch(this.sortVal) {
                    case 'year':
                        sortProp = 'YEAR'
                        break
                    case 'college':
                        sortProp = 'LEVEL_2_NAME'
                        break
                    case 'program':
                        sortProp = "MAJOR_DESC"
                        break
                }

                this.tableData = []
                for (let i = Number(this.minYearSelected); i <= Number(this.maxYearSelected); i++) {
                    this.enrollmentData[String(i)].forEach((obj) => {
                        let foundMatch = false
                        this.tableData.forEach((tableObj) => {
                            if (tableObj[sortProp] === obj[sortProp]) {
                                tableObj.NUMBER_ENROLLED = String(Number(tableObj.NUMBER_ENROLLED) + Number(obj.NUMBER_ENROLLED))
                                foundMatch = true
                            }
                        })
                        if (!foundMatch) {
                            this.tableData.push(this.deepCopy(obj))
                        }
                    })
                }
                if (sortProp === 'YEAR') {
                    this.tableData.sort((a,b) => { return a[sortProp] > b[sortProp] ? -1 : 1 })
                } else {
                    this.tableData.sort((a, b) => { return a[sortProp] < b[sortProp] ? -1 : 1 })
                }
            },
            async loadTable() {
                if (this.minYearSelected > this.maxYearSelected) {
                    return
                }
                while (!this.enrollmentData) {
                    this.loading = true
                    await this.sleep(1000)
                }
                this.loading = false

                this.configureTable()
                this.sortTable()
            },
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
            configureTable() {
                if (this.sortVal === "college") {
                    this.tableConfig = [
                        {
                            prop: "LEVEL_2_NAME",
                            name: "College",
                            searchable: true,
                            sortable: true,
                            width: 20
                        },
                        {
                            prop: "NUMBER_ENROLLED",
                            name: `Total Enrolled ${this.minYearSelected}-${this.maxYearSelected}`,
                            searchable: true,
                            sortable: true,
                            isHidden: false,
                            alignItems: 'center',
                            width: 10
                        },
                    ]
                } else if (this.sortVal === "year"){
                    this.tableConfig = [
                        {
                            prop: "YEAR",
                            name: "Year",
                            searchable: true,
                            sortable: true,
                            width: 20
                        },
                        {
                            prop: "NUMBER_ENROLLED",
                            name: "Total Enrolled at BYU",
                            searchable: true,
                            sortable: true,
                            isHidden: false,
                            alignItems: 'center',
                            width: 10
                        },
                    ]
                } else if (this.sortVal === "program") {
                    this.tableConfig = [
                        {
                            prop: "MAJOR_DESC",
                            name: "Program",
                            searchable: true,
                            sortable: true,
                            width: 20
                        },
                        {
                            prop: "NUMBER_ENROLLED",
                            name: `Total Enrolled ${this.minYearSelected}-${this.maxYearSelected}`,
                            searchable: true,
                            sortable: true,
                            isHidden: false,
                            alignItems: 'center',
                            width: 10
                        },
                    ]
                } else if (this.sortVal === "department") {
                    this.tableConfig = [
                        {
                            prop: "MAJOR_DESC",
                            name: "Program",
                            searchable: true,
                            sortable: true,
                            width: 20
                        },
                        {
                            prop: "NUMBER_ENROLLED",
                            name: "Total Enrolled at BYU",
                            searchable: true,
                            sortable: true,
                            isHidden: false,
                            alignItems: 'center',
                            width: 10
                        },
                    ]
                }
            },
            sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },
            deepCopy(obj) {
                let newObj = obj;
                if (obj && typeof obj === 'object') {
                    newObj = Object.prototype.toString.call(obj) === "[object Array]" ? [] : {};
                    for (var i in obj) {
                        newObj[i] = this.deepCopy(obj[i]);
                    }
                }
                return newObj;
            },
        }
    }
</script>

<style lang="stylus" scoped>

</style>
