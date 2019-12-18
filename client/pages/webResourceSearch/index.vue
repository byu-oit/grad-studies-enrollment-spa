<template>
    <section class="container">
        <div v-if="$byu.user">
        </div>
        <div v-else style="margin-top: 20px">
            Please sign in to continue
        </div>
        <input type="button" @click="back" class="back" value="Back">
        <br><br>
        <div class="row">
            <h3 class="d-inline col-2 row-1">Search for</h3>
            <sim-input
                    class="d-inline-flex col-2 row-1"
                    v-model="searchTerm"
                    placeholder="Search Term"
                    @keyup.enter="search"
            ></sim-input>
            <h3 class="d-inline row-1">within</h3>
            <div class="d-inline-block row-1">
                <sim-select
                        :items="contexts"
                        class="d-inline-flex search col-2 row-1"
                        :itemText="_getContextName"
                        :itemValue="_getContextValue"
                        v-model="context"
                        :error-messages="hasMessage"
                        label=""
                ></sim-select>
            </div>

            <input type="submit" class="button" @click="search" :loading="loading" value="Search">
        </div>

        <br>
        <div v-if="searchResults && searchResults.length > 0">
            <div style="margin: 5px 0;" class="d-inline-block row">
                <div class="tabular">
                    <div style="vertical-align: center;">Found
                        <sim-formatted-number :value="searchResults.length"></sim-formatted-number>
                        {{possibility}}
                    </div>
                    <input type="button" @click="searchAll" class="searchAll button" value="Search All of BYU">
                </div>
            </div>
            <br> <br>
            <div v-for="result in paginatedData" class="result">
                <a @click="changePage(result.speedUrl)" class="link">
                    <h3 id="title">{{result.pageName}}</h3>
                    <p v-if="result.speedUrl" class="no-margin">{{result.speedUrl}}</p>
                    <p v-else class="no-margin">{{result.url}}</p>
                </a>
                <p class="no-margin">{{result.description}}</p>
                <br>
            </div>

            <br>
            <section style="text-align: center">
                <div class="tabular d-inline-flex row" style="align-self: center;">
                    <div style="margin-right: 4px" class="row-1">Showing
                        <sim-formatted-number :value="resultNum + 1"></sim-formatted-number>
                        -
                        <sim-formatted-number
                                :value="resultNum + paginatedData.length"
                        ></sim-formatted-number>
                    </div>
                    <div v-if="searchResults.length > size">
                        <div class="tabular">
                            <div style="margin-right: 10px" class="row-1">on page:</div>
                            <div class="SIM-informative pageAction">
                                <input type="button" class="button chevron" value="<<" @click="prevPage" :disabled="pageNumber === 0">
                            </div>
                            <div class="SIM-informative" style="margin: 0 10px">
                                <select  id="choose-page" @input="selectPage" class="row-1">
                                    <option v-for="n in pageCount" :label="n" :selected="isSelectedPage(n)" :value="n"
                                            :key="n">{{n}}
                                    </option>
                                </select>
                                <span> of {{pageCount}}</span>
                            </div>
                            <div class="SIM-informative pageAction">
                                <input type="button" class="button chevron" value=">>" @click="nextPage" :disabled="pageNumber >= pageCount - 1">
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <div v-else-if="searchResults" class="warning padding">
<!--            Make an alert-->
            <h5 class="padding d-inline">No results found</h5>
        </div>
        <div v-else-if="error" class="error padding">
            <v-icon class="d-inline" style="vertical-align: middle;">error</v-icon>
            <p class="padding d-inline" style="color: white;">{{error}}</p>
        </div>

    </section>
</template>

<script>
    import SimInput from "../../components/sim-input/index"
    import SimSelect from "../../components/sim-select/index"
    import SimFormattedNumber from '../../components/sim-formatted-number/SimFormattedNumber'

    export default {
        components: {
            SimInput,
            SimSelect,
            SimFormattedNumber
        },
        navigationMenu(to, from, prev) {
            return null
        },
        pageTitle(to, from, prev) {
            return 'Search Results'
        },
        data() {
            return {
                pageNumber: 0,
                size: 10, //num of results per page
                loading: false,
                contextIds: [],
                contexts: [],
                context: null,
                contextSelect: null,
                searchTerm: null,
                hasMessage: null,
                error: null
            }
        },
        methods: {
            nextPage() {
                this.pageNumber++
            },
            prevPage() {
                this.pageNumber--
            },
            selectPage(n) {
                this.pageNumber = n.target.value - 1
            },
            isSelectedPage(pageNum) {
                return pageNum - 1 === this.pageNumber
            },
            back() {
                this.$store.commit('SIMSearch/setResource', null);
                this.$router.go(-1)
            },
            _getContextName(context) {
                this.contexts.push(context.productName); //TEST
                return context.productName
            },
            _getContextValue(context) {
                return context.productId
            },
            async search() {
                this.loading = true;
                this.error = null;
                let response;
                try {
                    for (let i = 0; i < this.contextIds.length; i++) {
                        if (this.context === this.contextIds[i].productName) {
                            this.contextSelect = this.contextIds[i].productId
                        }
                    }
                    if (this.searchTerm) {
                        let searchData = {productId: this.contextSelect, term: this.searchTerm};
                        response = await this.$store.dispatch('SIMSearch/getSearchResults', searchData)
                    } else {
                        response = await this.$store.dispatch('SIMSearch/getResultsInContext', this.contextSelect)
                    }
                    if (response.status === 200 && response.data.content) {
                        this.$store.commit('SIMSearch/searchResults', response.data.content);
                        this.$store.commit('SIMSearch/searchTerm', this.searchTerm)
                    } else {
                        console.log("error", response);
                        this.error = response.status + ": An Unexpected Error Occurred"
                    }
                } catch(err) {
                    console.log("error", err);
                    this.error = err.message
                }


                this.loading = false;
                this.pageNumber = 0

            },
            searchAll() {
                this.$byu.navigateTo(this.searchAllBYU)
            },
            changePage(surl){
                this.$store.commit('SIMSearch/setResource', surl);
                this.$router.go(-1)
            }
        },
        computed: {
            searchResults() {
                return this.$store.state.SIMSearch.searchResults
            },
            pageCount() {
                let l = this.searchResults.length;
                let s = this.size; //number of results per page
                return Math.ceil(l / s)
            },
            paginatedData() {
                const start = this.pageNumber * this.size;
                const end = start + this.size;
                return this.searchResults.slice(start, end)
            },
            searchAllBYU() {
                let url = 'https://byu.edu/search/byu';
                if (this.searchTerm) {
                    url += '?keys=' + this.searchTerm
                }
                return url
            },
            resultNum() {
                return this.pageNumber * this.size
            },
            possibility() {
                if(this.searchResults.length === 1) {
                    return 'possibility.'
                }
                return 'possibilities.'
            },
            message() {
                if(this.hasMessage) {
                    return this.hasMessage
                }
                return ""
            }
        },
        async asyncData({store, app}) {
            const response = await store.dispatch('SIMSearch/getContexts');
            if (response.status === 200) {
                let ids = response.data.content;
                let content = [];
                for (let i = 0; i < ids.length; i++) {
                    content.push(ids[i].productName)
                }
                content.unshift("All Products and Services");
                ids.unshift({productName: "All Products and Services", productId: null});
                return {contextIds: ids, contexts: content, context: null, searchTerm: store.state.SIMSearch.searchTerm}
            }
            else {
                return {hasMessage: "Error Loading Search Contexts"}
            }
        },
        pageSearch({to, from, previous}) {
            return null
        }

    }
</script>

<style lang="stylus" scoped>
    .list {
        width: 45%;
        position: relative;
        float: left;
    }

    .margin {
        margin-left: 20px;
    }

    .back {
        padding: 10px;
        margin-left: 10px;
        margin-right: 10px;
        margin-top: 17px;
        margin-bottom: 10px;
        color: white;
        background-color: #002e5d;
    }

    .button {
        padding: 10px;
        color: white;
        background-color: #002e5d;
    }

    .chevron {
        padding: 7px;
    }

    .row-1 {
        margin-top: 10px;
    }

    .result {
        margin-left: 5rem;
        color: black;
        padding-left: 1rem;
    }

    .padding {
        padding: 15px;
    }

    .link {
        color: black;
        text-decoration: none;
        display: table;
    }

    .link:hover #title {
        text-decoration: underline;
    }

    .no-margin {
        margin: 0;
        padding: 0;
    }
    .search {
        margin: 0 10px;
    }
    .searchAll {
        padding: 7px;
        margin: 0 10px;
        font-size:small;
        position: relative;
        bottom: 4px;
    }
    #choose-page {
        border-bottom: 1px solid;
        -moz-border-radius: 0;
        -webkit-border-radius: 0;
        border-radius: 0;
    }
    #choose-page:hover {
        cursor: pointer;
    }
</style>
