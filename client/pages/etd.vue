<template>
    <section>
        <loading :show="loading" :label="label"></loading>
        <message></message>
        <div v-if="$byu.user">
            <div v-if="studentList">
                <div id='student-list-header' style="border: 1px black solid; padding: 5px; margin-bottom: 15px; background: #eee; justify-content: space-between; align-items: center" class="tabular tabular-wrap">
                    <div style="margin: 0 10px">There are currently <b>{{_formattedNumber(studentList.length)}}</b> students <span style="font-size: smaller">(excluding newly admitted)</span> required to complete an ETD</div>
                    <div style="margin: 0 10px" class="SIM-button accept" @click="_generateDownloadFile">Generate Listserve file</div>
                </div>
                <sim-table
                        v-if="studentList"
                        :config="tableConfig"
                        :data="studentList"
                        :hoverHighlight="false"
                        :item-height="40"
                        :height="tableHeight"
                        fontSize="15px;"
                        :sortParam="sortParam"
                        :key="reloadKey"
                >
                </sim-table>
            </div>
            <div v-else>
                <public v-if="!loading"></public>
            </div>
        </div>
        <h2 v-else>
            <public></public>
        </h2>
    </section>
</template>

<script>
    import SimTable from '../components/sim-table/index'
    import Message from '../components/message'
    import accounting from '../accounting.min'
    import LocalFileSystem from '../mixins/LocalFileSystem'
    import Public from "../components/public";
    import Sizing from "../mixins/Sizing";

    export default {
        data: function () {
            return {
                label: "Loading",
                downloadFn: "etd.txt",
                tableHeight: 300,
                sortParam: {
                    col: 'name',
                    direction: 'asc'
                },
                tableConfig: [
                    {
                        prop: "sortName",
                        name: "Name",
                        sortable: true,
                        isHidden: false,
                        alignItems: 'left',
                        width: 150
                    },
                    {
                        prop: "emailAddress",
                        name: "Email Address",
                        sortable: true,
                        isHidden: false,
                        alignItems: 'left',
                        width: 200
                    }
                ]
            }
        },
        components: {
            Public,
            Message,
            SimTable
        },
        mixins: [LocalFileSystem, Sizing],
        computed: {
            studentList() {
                return this.$store.state.ETDStudentList
            },
            loading() {
                return this.$store.state.loading
            },
            reloadKey() {
                return this.$store.state.reloadKey
            }
        },
        methods: {
            _formattedNumber(num) {
                return accounting.formatNumber(num)
            },
            _generateDownloadFile() {
                this._downloadTextFile(this.studentList, this.downloadFn)
            }
        },
        mounted() {
            if (!this.studentList) {
                this.$store.dispatch('fetchStudentList', 'etd')
            }
            this.tableHeight = this._sizeTable()
        }
    }
</script>

<style lang="stylus" scoped>
</style>
