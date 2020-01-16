<template>
    <section>
        <div v-if="loading" style="z-index: 10; position: absolute; padding: 15px; background-color: #ededed; border-radius: 15px; display: flex;">
            <div style="margin: 5px 10px 0 0;">Loading years...</div>
            <img src="../assets/images/loading.gif" height="32" alt="Loading...">
        </div>
        <div v-else style="z-index: 10; position: absolute; padding: 15px;">
            <img src="../assets/images/checkmark.jpg" height="40" alt="">
        </div>
        <div style="text-align: center;">
            <div style="margin: 0 0 0 100px;">
                <div style="float: left;">
                    Sort<br>
                    <select v-model="sortVal" @change="loadTable" id="sortVal" style="font-size: 14px; margin-top: 5px;">
                        <option value="year">Year</option>
                        <option value="college">College</option>
                        <option value="program">Program</option>
                    </select>
                </div>
                <div style="float: left; margin-left: 5%;">
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
                enrollmentData: {},
                tableData: [],
                loading: false,
                currentYear: String(new Date().getFullYear()),
                minYearSelected: String(new Date().getFullYear()),
                maxYearSelected: String(new Date().getFullYear()),
                yearSelectHTML: "",
                sortVal: "year", //OPTIONS: college, year, program, department
                dropdownError: null,
                absoluteMinYear: '2004',

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
            this.fetchData()
            this.getYearOptions()
            this.loadTable()
        },
        methods: {
            ...mapActions ([
                'fetchEnrollmentByYear',
            ]),
            async fetchData() {
                for (let i = Number(this.currentYear); i >= Number(this.absoluteMinYear); i--) {
                    await this.fetchEnrollmentByYear(String(i))
                    this.enrollmentData[String(i)] = this.getEnrollmentData[String(i)]
                    this.enrollmentData[String(i)].forEach((obj) => {
                        obj.YEAR = String(i)
                    })
                }
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

                this.loading = true
                while (this.loading) {
                    let dataAvailable = true
                    for (let i = Number(this.maxYearSelected); i >= Number(this.minYearSelected); i--) {
                        if (!this.enrollmentData[String(i)]) {
                            dataAvailable = false
                        }
                    }
                    if (dataAvailable) {
                        this.loading = false
                    } else {
                        await this.sleep(1000)
                    }
                }

                this.configureTable()
                this.sortTable()
            },
            getYearOptions() {
                for (let i = Number(this.currentYear); i >= Number(this.absoluteMinYear); i--) {
                    this.yearSelectHTML += `<option value="${i}">${i}</option>`
                }
            },
            configureTable() {
                let sortProp = null
                let column1Header = null
                let column2Header = null
                switch(this.sortVal) {
                    case 'year':
                        sortProp = 'YEAR'
                        column1Header = 'Year'
                        column2Header = 'Total Enrolled at BYU'
                        break
                    case 'college':
                        sortProp = 'LEVEL_2_NAME'
                        column1Header = 'College'
                        column2Header = `Total Enrolled ${this.minYearSelected}-${this.maxYearSelected}`
                        break
                    case 'program':
                        sortProp = "MAJOR_DESC"
                        column1Header = 'Program'
                        column2Header = `Total Enrolled ${this.minYearSelected}-${this.maxYearSelected}`
                        break
                }
                this.tableConfig = [
                    {
                        prop: sortProp,
                        name: column1Header,
                        searchable: true,
                        sortable: true,
                        width: 15
                    },
                    {
                        prop: "NUMBER_ENROLLED",
                        name: column2Header,
                        searchable: true,
                        sortable: true,
                        isHidden: false,
                        alignItems: 'center',
                        width: 10
                    },
                ]
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
