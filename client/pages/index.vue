<template>
    <section>
        <div v-if="authenticated">
            <div v-if="loading" class="loadingBlock">
                <div>Loading years...</div>&nbsp&nbsp
                <img src="../assets/images/loading.gif" height="32" style="margin-top: -5px;" alt="Loading...">
            </div>
            <div class="table shadow">
                <!-- Table menu bar for sorting -->
                <ul class="tableBar" v-model="sortVal">
                    <li><a @click="loadTable('year')">Year</a></li>
                    <li><a @click="loadTable('program')">Program</a></li>
                    <li><a @click="loadTable('college')">College</a></li>
                    <li><a @click="loadTable('department')">Department</a></li>
                    <ul class="yearSelector">
                        <li class="dropdown">
                            <a class="dropbtn">{{minYearSelected}}</a>
                            <div v-model="minYearSelected" class="dropdown-content">
                                <a v-for="year in yearOptions" @click="function() {minYearSelected=year; loadTable();}">{{year}}</a>
                            </div>
                        </li>
                        <li class="dropdown inactive" style="margin: 0 -10px 0 -10px;">
                            <a>&ndash;</a>
                        </li>
                        <li class="dropdown">
                            <a class="dropbtn">{{maxYearSelected}}</a>
                            <div class="dropdown-content">
                                <div v-model="minYearSelected" class="dropdown-content">
                                    <a v-for="year in yearOptions" @click="function() {maxYearSelected=year; loadTable();}">{{year}}</a>
                                </div>
                            </div>
                        </li>
                    </ul>
                    </ul>

                <sim-table
                        :config="tableConfig"
                        :data="tableData"
                        :height="0"
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
                yearOptions: [],
                sortVal: "year", //OPTIONS: college, year, program, department
                absoluteMinYear: '2004',

                //Table Configuration
                tableConfig: [],
                tableAttribute: {
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
            insertTableData() {
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
                    this.enrollmentData[String(i)].forEach((enrollmentDataObject) => {
                        let obj = this.deepCopy(enrollmentDataObject) // This is to avoid vuex mutation errors
                        if (obj[sortProp] === null) {
                            obj[sortProp] = obj["LEVEL_2_NAME"]
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

            async loadTable(val = this.sortVal) {
                this.sortVal = val
                // Swap the year values to make sure minYearSelected is the smallest
                if (this.minYearSelected > this.maxYearSelected) {
                    let temp = this.minYearSelected;
                    this.minYearSelected = this.maxYearSelected;
                    this.maxYearSelected = temp;
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
                this.insertTableData()
            },
            getYearOptions() {
                for (let i = Number(this.currentYear); i >= Number(this.absoluteMinYear); i--) {
                    this.yearOptions.push(i);
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
                        column2Header = `Total Enrolled ${this.minYearSelected} – ${this.maxYearSelected}`
                        break
                    case 'program':
                        sortProp = "MAJOR_DESC"
                        column1Header = 'Program'
                        column2Header = `Total Enrolled ${this.minYearSelected} – ${this.maxYearSelected}`
                        break
                    case 'department':
                        sortProp = "LEVEL_3_NAME"
                        column1Header = "Department"
                        column2Header = `Total Enrolled ${this.minYearSelected} – ${this.maxYearSelected}`
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
    ul.tableBar, ul.yearSelector {
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #333;
    }

    ul.yearSelector{
        float: right;
        display: flex;
    }

    ul.tableBar li.right {float: right;}

    ul.tableBar li {
        float: left;
    }

    ul.tableBar li a, .dropbtn {
        display: inline-block;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
    }

    ul.yearSelector li a:hover, ul.tableBar li a:hover, .dropdown:hover .dropbtn {
        background-color: #212121;
        cursor: pointer;
    }

    ul.yearSelector li.inactive a:hover {
        background-color: #333;
        cursor: default;
    }

    ul.yearSelector li.dropdown {
        display: inline;
    }

    ul.yearSelector .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
        height: 300px;
        overflow-y: auto
    }

    ul.yearSelector .dropdown-content a {
        color: black;
        padding: 4px 16px;
        text-decoration: none;
        display: block;
        text-align: left;
    }

    ul.yearSelector .dropdown-content a:hover {
        background-color: #f1f1f1;
    }

    ul.yearSelector .dropdown:hover .dropdown-content {
        display: block;
        cursor: pointer;
    }

    ul.yearSelector .dropdown .dropdown-content {
        display: none;
    }

    .table {
        margin: 0 8% 0 8%
    }

    .shadow {
        box-shadow: 1px 1px 3px 1px #b7b7b7;
    }

    .loadingBlock {
        z-index: 10;
        top: 30%;
        left: 50%;
        margin-top: -50px;
        margin-left: -100px;
        position: fixed;
        padding: 40px 30px 30px 30px;
        background-color: #ededed;
        border-radius: 15px;
        display: flex;
        opacity: .9;
    }

    @media screen and (max-width: 700px) {
        ul.tableBar,
        ul.tableBar li {
            float: none;
            text-align: center;
        }
        ul.tableBar li:not(.dropdown) a {
            width: 100%;
        }
        ul.tableBar li.dropdown {
            text-align: center;
            display: inline-block;
            width: 100%;
        }
        ul.yearSelector {
            margin-right: 20%;
        }
    }

    .errorMessage {
        color: red;
    }
</style>
