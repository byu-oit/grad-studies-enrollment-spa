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
// DO NOT MODIFY THESE VALUES HERE
// The defaults are set in the config.js "site" property
export const state = () => ({
    navigationLinks: [],
    pageTitle: {},
    searchHandler: null,
    searchValue: ''
});

// export mutations object
export const mutations = {
    searchHandlerUpdate (state, payload) {
        state.searchHandler = payload;
    },
    searchValueUpdate (state, payload) {
        if (typeof payload !== 'string') payload = '';
        state.searchValue = payload;
    },
    updateNavigation (state, links) {
        if (!links) links = [];
        state.navigationLinks = links;
    },
    updateTitle (state, newTitle) {
        if (typeof newTitle === 'string') newTitle = { main: newTitle };
        newTitle = Object.assign({}, newTitle);
        if (typeof newTitle.pre !== 'string') newTitle.pre = '';
        if (typeof newTitle.main !== 'string') newTitle.main = '';
        if (typeof newTitle.post !== 'string') newTitle.post = '';
        state.pageTitle = newTitle;
    }
};