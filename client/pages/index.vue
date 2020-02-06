<template>
    <section>
        <div v-if="authenticated">
            <div v-if="loading" class="loadingBlock">
                <div style="margin: 5px 10px 0 0;">Loading years...</div>
                <img src="../assets/images/loading.gif" height="32" alt="Loading...">
            </div>
            <div style="text-align: center;">
                <div style="display: inline-block;">
                    <div class="dropdownSection">
                        <div class="col">
                            Sort<br>
                            <select v-model="sortVal" @change="loadTable" id="sortVal" style="font-size: 14px; margin-top: 5px;">
                                <option value="year">Year</option>
                                <option value="college">College</option>
                                <option value="program">Program</option>
                                <option value="department">Department</option>
                            </select>
                        </div>
                        <div class="col" style="display: inline-block;">
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
                        font-size="18px"
                >
                </sim-table>
            </div>
        </div>
        <div v-else>
            <h1>You must sign in to view this page</h1>
        </div>
    </section>
</template>

<script>
    import {mapActions, mapGetters, mapMutations} from 'vuex'
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
                    enableExport: true,
                    bordered: true,
                    hoverHighlight: true,
                    language: "en",
                    sortParam: { col: "sortName", direction: "asc" },
                },
            }
        },
        computed: {
            ...mapGetters ([
                'getEnrollmentData',
                'getLoading',
                'getAuthenticated',
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
            },
            authenticated: function() {
                return this.getAuthenticated;
            },
        },
        components: {
            simTable,
        },
        mounted() {
            if (this.authenticated) {
                this.fetchData()
                this.getYearOptions()
                this.loadTable()
            }
        },
        methods: {
            ...mapActions([
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
                    case 'department':
                        sortProp = "LEVEL_3_NAME"
                        break
                }

                this.tableData = []
                for (let i = Number(this.minYearSelected); i <= Number(this.maxYearSelected); i++) {
                    this.enrollmentData[String(i)].forEach((obj) => {
                        if (obj[sortProp] === null) {
                            obj[sortProp] = "[Other]"
                        }
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

                // Sort years backwards and everything else in alphabetical order
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
                        await this.sleep(2000)
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
                    case 'department':
                        sortProp = "LEVEL_3_NAME"
                        column1Header = "Department"
                        column2Header = `Total Enrolled ${this.minYearSelected}-${this.maxYearSelected}`
                }
                this.tableConfig = [
                    {
                        prop: sortProp,
                        name: column1Header,
                        searchable: true,
                        sortable: true,
                        showSummary: true,
                        summary: "COUNT",
                        width: 15
                    },
                    {
                        prop: "NUMBER_ENROLLED",
                        name: column2Header,
                        searchable: true,
                        sortable: true,
                        isHidden: false,
                        showSummary: true,
                        summary: "SUM",
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
