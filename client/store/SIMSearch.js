/**
 *  @license
 *    Copyright 2018 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict';

// export state as a function
export const state = () => ({
    searchResults: null,
    searchTerm: null
});

// export mutations object
export const mutations = {
    searchResults(state, newResults) {
        state.searchResults = JSON.parse(JSON.stringify(newResults))
    },
    searchTerm(state, search) {
        state.searchTerm = search
    }
};

const makeRequest = (app, request) => {
    return new Promise((resolve, reject) => {
        app.$byu.auth.request(request, (body, status) => {
            if (status === 200) {
                body = JSON.parse(body)
            } else {
                body = null
            }
            resolve({status: status, data: body})
        })
    })
}

export const actions = {
    getContexts: async function(context) {
        let servicePath = '/accessManagement/v1/domains/dropdown'
        const request = {
            method: "GET",
            url: "https://api.byu.edu" + servicePath
        }
        return makeRequest(this.app, request)
    },
    getSearchResults: async function(context, search) {
        search.term = search.term.trim()
        let servicePath = "/accessManagement/v1/webResource/pattern/" + search.term
        if(search.productId) {
            servicePath += '/domain/' + search.productId
        }
        const request = {
            method: "GET",
            url: "https://api.byu.edu" + servicePath
        }
        return makeRequest(this.app, request)
    },
    getResultsInContext: async function(context, productId) {

        let servicePath = '/accessManagement/v1/webResource'
        if(productId) {
            servicePath += '?productId=' + productId
        }
        const request = {
            method: "GET",
            url: "https://api.byu.edu" + servicePath
        }
        return makeRequest(this.app, request)
    }
}