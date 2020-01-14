<template>
    <section>
        <div style="text-align: center;">
            <div v-if="yearSelectHTML" style="display: inline-block;">
                <div style="font-size: 32px;">Years</div>
                <div style="display: flex;">
                    <div style="margin-right: 10px;">
                        <label for="minYear"/>
                        <select v-html="yearSelectHTML" v-model="minYearSelected" @change="loadTable" id="minYear"/>
                    </div>
                    &ndash;
                    <div style="margin-left: 10px;">
                        <label for="maxYear"/>
                        <select v-html="yearSelectHTML" v-model="maxYearSelected" @change="loadTable" id="maxYear"/>
                    </div>
                </div>
            </div>
            <div v-else style="text-align: left; font-size: 26px;">
                <p>Loading . . .</p>
            </div>
        </div>
        <div style="display: flex; margin: -20px 0 20px 20px; font-size: 16px;">
            Sort by: &nbsp
            <select v-model="sortVal" @change="loadTable" id="sortVal">
                <option value="college">College</option>
                <option value="year">Year</option>
                <option value="department">Department</option>
                <option value="program">Program</option>
            </select>
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
                enrollmentData: null,
                tableData: [],
                currentYear: String(new Date().getFullYear()),
                minYearSelected: String(new Date().getFullYear()),
                maxYearSelected: String(new Date().getFullYear()),
                yearSelectHTML: "",
                sortVal: "college", //OPTIONS: college, year, program, department

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
            ])
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
            },
            async getAllYears() {
                const absoluteMinYear = this.getAbsoluteMinYear
                let params = ""
                for (let i = Number(this.currentYear); i >= Number(absoluteMinYear); i--) {
                    params += String(i) + "/"
                }
                await this.fetchEnrollmentByYear(params)
                this.enrollmentData = this.deepCopy(this.getEnrollmentData)
            },
            sortByYear() {
                console.log("sortByYear")
                this.tableData = []
                for (let i = Number(this.minYearSelected); i <= Number(this.maxYearSelected); i++) {
                    this.enrollmentData[String(i)].forEach((obj) => {
                        let foundMatch = false
                        this.tableData.forEach((tableObj) => {
                            if (tableObj.LEVEL_2_NAME === obj.LEVEL_2_NAME) {
                                tableObj.NUMBER_ENROLLED = String(Number(tableObj.NUMBER_ENROLLED) + Number(obj.NUMBER_ENROLLED))
                                foundMatch = true
                            }
                        })
                        if (!foundMatch) {
                            this.tableData.push(this.deepCopy(obj))
                        }
                    })
                }
                this.tableData.sort((a,b) => {return a.LEVEL_2_NAME > b.LEVEL_2_NAME ? 1 : -1})
            },
            sortByCollege() {
                console.log("sortByCollege")
                this.tableData = []
                for (let i = Number(this.minYearSelected); i <= Number(this.maxYearSelected); i++) {
                    this.enrollmentData[String(i)].forEach((obj) => {
                        let foundMatch = false
                        this.tableData.forEach((tableObj) => {
                            if (tableObj.LEVEL_2_NAME === obj.LEVEL_2_NAME) {
                                tableObj.NUMBER_ENROLLED = String(Number(tableObj.NUMBER_ENROLLED) + Number(obj.NUMBER_ENROLLED))
                                foundMatch = true
                            }
                        })
                        if (!foundMatch) {
                            this.tableData.push(this.deepCopy(obj))
                        }
                    })
                }
                this.tableData.sort((a,b) => {return a.LEVEL_2_NAME > b.LEVEL_2_NAME ? 1 : -1})
            },
            sortByProgram() {
                console.log("sortByProgram")
            },
            sortByDepartment() {
                console.log("sortByDepartment")
            },
            async loadTable() {
                while (!this.enrollmentData) {
                    console.log("Still loading...")
                    await this.sleep(5000)
                }

                this.configureTable()
                switch (this.sortVal) {
                    case "college":
                        this.sortByCollege()
                        break
                    case "year":
                        this.sortByYear()
                        break
                    case "program":
                        this.sortByProgram()
                        break
                    case "department":
                        this.sortByDepartment()
                        break
                }
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
                            prop: "year",
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
                            prop: "year",
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
                } else if (this.sortVal === "department") {
                    this.tableConfig = [
                        {
                            prop: "year",
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
