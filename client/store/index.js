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

import Dater from '../mixins/Date'

// export state as a function
export const state = () => ({
    enrollmentData: null,
    loading: false,
    rowSelected: {},
    hasMessage: false,
    reloadKey: 0
});

// export getters object
export const getters = {
    getEnrollmentData: state => {
        return state.enrollmentData
    }
}

// export mutations object
export const mutations = {
    setCurrentStudentList(state, arr) {
        state.currentStudentList = arr
        state.currentStudentList.sort(function(a, b){ return a.sortName > b.sortName}) //sort by name
    },
    setETDStudentList(state, arr) {
        state.ETDStudentList = arr
        state.ETDStudentList.sort(function(a, b){ return a.sortName > b.sortName}) //sort by name
    },
    setNewlyAdmittedStudentList(state, arr) {
        state.newlyAdmittedStudentList = arr
        state.newlyAdmittedStudentList.sort(function(a, b){ return a.sortName > b.sortName}) //sort by name
    },
    setLoading(state, bool) {
        state.loading = bool
    },
    setRowSelected(state, obj) {
        state.rowSelected = obj
    },
    setHasMessage(state, val) {
        state.hasMessage = val
    },
    setReloadKey(state) {
        state.reloadKey = state.reloadKey + 1
    },
    setEnrollmentData(state, obj) {
        state.enrollmentData = obj;
    }
};

// export actions object
export const actions = {

    // server side only execution for pre-populating the Vuex store
    nuxtServerInit: ({ commit }, { req }) => {
        const wabs = req.wabs || {};

        // update user and auth data
        commit('wabs/authUpdate', wabs.auth);
        commit('wabs/userUpdate', wabs.user);
    },

    // fetchEnrollmentByYear(context, year) {
    //     context.commit('setLoading', true)
    //     const request = {
    //         method: "GET",
    //         url: `https://api.byu.edu/graduateStudiesYAPI/v1.0/student/enrollments/year/${year}`
    //     }
    //     return new Promise((resolve, reject) => {
    //         if (!this.app.$byu.user) {
    //             context.commit('setLoading', false)
    //         }
    //         this.app.$byu.auth.request(request, (body, status) => {
    //             context.commit('setLoading', false)
    //             if (status >= 400) {
    //                 if (status === 401) {
    //                     if (process.client) {
    //                         window.location.reload()
    //                     }
    //                 }
    //                 context.commit('setHasMessage', 'An error occured getting student list.')
    //                 console.error(`${status} - ${body}`)
    //                 resolve(false)
    //             }
    //             else {
    //                 context.commit('setEnrollmentData', JSON.parse(body).content)
    //                 resolve(true)
    //             }
    //         })
    //     })
    // },

    //Simplified version
    fetchEnrollmentByYear(context, year) {
        context.commit('setLoading', true)
        const options = {
            method: "GET",
            url: `https://api.byu.edu/graduateStudiesYAPI/v1.0/student/enrollments/year/${year}`
        }
        if (!this.app.$byu.user) {
            context.commit('setLoading', false)
        }
        return this.app.$byu.auth.request(options)
            .then(result => {
                if (status >= 400) {
                    if (status === 401) {
                        if (process.client) {
                            window.location.reload()
                        }
                    }
                    context.commit('setHasMessage', 'An error occured getting student list.')
                    console.error(`${status} - ${result}`)
                }
                else {
                    let data = JSON.parse(result.body)
                    context.commit('setEnrollmentData', data.content)
                    console.log("during")
                }
            })
    }
};
