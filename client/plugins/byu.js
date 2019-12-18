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
import axios from '~/plugins/axios'
import { site } from '~~/config'
import Vue from 'vue';

// ignore any components that start with byu-
const byuWebComponentNames = [
    /^byu-/,
];

// tell vue to ignore the BYU web components
if (!Array.isArray(Vue.config.ignoredElements)) Vue.config.ignoredElements = [];
byuWebComponentNames.forEach(name => {
    if (Vue.config.ignoredElements.indexOf(name) === -1) Vue.config.ignoredElements.push(name)
});

// This plugin must exist outside of the exported function or it will not run server side.
Vue.use({
    install: function (Vue) {

        //////////////////////////////////////////////////////
        //                                                  //
        //      WATCH FOR ROUTE CHANGES                     //
        //                                                  //
        //////////////////////////////////////////////////////

        Vue.mixin({

            // if component has byuNavigation property then update nav
            beforeRouteEnter(to, from, next) {
                next(vm => routeEnter(vm, vm.$route, from));
            },

            // if component has byuNavigation property then update nav
            beforeRouteUpdate(to, from, next) {
                routeEnter(this, to, from);
                next();
            }

        });
    }
});

export default function({ app, store, req, res, redirect }) {

    Vue.use({
        install: function (Vue) {

            const byu = process.server ? {} : window.byu;

            function requestOptions(options) {
                var config = typeof options === 'string' ? { url: options } : Object.assign({}, options);

                if (typeof config.url !== 'string') throw Error('Missing required property: url');
                if (!config.method) config.method = 'GET';
                config.method = config.method.toUpperCase();

                // put all header names to lower case
                var headers = {};
                if (!config.headers) config.headers = {};
                Object.keys(config.headers)
                    .forEach(function(name) {
                        headers[name.toLowerCase()] = config.headers[name];
                    });
                config.headers = headers;

                // if the body is an object then stringify and add
                if (config.body && typeof config.body === 'object') {
                    if (!config.headers['content-type']) config.headers['content-type'] = 'application/json';
                    config.body = JSON.stringify(config.body);
                }

                return config;
            }

            // add WABS properties to the byu object
            if (process.server) {
                byu.auth = {};
                const wabs = req.wabs;

                Object.defineProperties(byu, {
                    user: { get: () => wabs.user }
                });

                Object.defineProperties(byu.auth, {
                    accessToken: { get: () => wabs.auth && wabs.auth.accessToken },
                    expires: { get: () => wabs.auth && wabs.auth.expires }
                });

                byu.auth.login = function(success, options) {
                    if (!options) options = {};
                    if (typeof success === 'object') options = success;
                    if (!options.success) options.success = req.originalUrl;
                    if (!options.failure) options.failure = options.success;
                    redirect(wabs.config.reservedPath + '/login?success=' + encodeURIComponent(options.success) +
                        '&failure=' + encodeURIComponent(options.failure));
                };

                byu.auth.logout = function(redirect, options) {
                    const a = arguments;
                    let qs = '';
                    if (typeof a[0] === 'object') {
                        options = a[0];
                        redirect = '';
                    }
                    if (!redirect) redirect = req.originalUrl;
                    const location = wabs.config.reservedPath + '/logout';
                    if (!options) options = {};
                    ['cas', 'cFramework', 'wso2'].forEach(function(key) {
                        if ((!options.popup || key !== 'cFramework') && (!options || options[key] !== false)) qs += '&' + key;
                    });
                    redirect(location + '?redirect=' + encodeURIComponent(redirect) + qs);
                };

                byu.auth.proxy = function(options, callback) {
                    console.log('at proxy');
                    req.wabs.request(options)
                        .then(({ body, statusCode }) => callback(body, statusCode))
                        .catch(err => {
                            console.error(err.stack);
                            callback('Internal server error', 500);
                        });
                };

                byu.auth.refreshToken = function(options, callback) {
                    req.wabs.refreshTokens()
                        .then(() => {
                            if (callback) callback('', 200);
                        })
                        .catch(err => {
                            console.error(err.stack);
                            if (err.statusCode) {
                                callback(err.safeMessage ? err.message : '', err.statusCode);
                            } else {
                                callback('Internal server error', 500);
                            }
                        });
                };

                byu.auth.request = function(options, callback) {
                    if (!wabs.auth) throw Error('User must be authenticated to make a request.');
                    const accessToken = wabs.auth.accessToken;

                    options = Object.assign({}, options);
                    if (!options.headers) options.headers = {};
                    options.headers.authorization = 'Bearer ' + accessToken;

                    options = requestOptions(options);
                    const axOptions = {
                        url: options.url,
                        method: options.method.toLowerCase(),
                        headers: options.headers,
                        validateStatus: () => true
                    };
                    if (options.hasOwnProperty('body')) axOptions.data = options.body;

                    axios(axOptions)
                        .then(results => {
                            const body = results.data;
                            const code = results.status;
                            if (code === 401 && typeof body === 'string' && body.indexOf('<ams:code>900901</ams:code>') !== -1) {
                                byu.auth.refreshToken(() => {
                                    if (wabs.auth && wabs.auth.accessToken) {
                                      axOptions.headers.authorization = 'Bearer ' + wabs.auth.accessToken;
                                        axios(axOptions)
                                            .then(results => {
                                                if (callback) callback(results.data, results.status)
                                            })
                                            .catch(err => console.error(err.stack));
                                    }
                                })
                            } else if (callback) {
                                callback(results.data, results.status);
                            }
                        })
                        .catch(err => console.error(err.stack));
                };

                byu.auth.sync = function(options, callback) {
                    throw Error('Nuxt "byu" plugin disables use of byu.auth.sync() on server side render');
                };

                byu.auth.navigateTo = function(options, callback) {
                    throw Error('Nuxt "byu" plugin disables use of byu.auth.sync() on server side render');
                };
            }

            let searchTimeout;
            byu.search = {
                submit(value, autoSearch) {
                    clearTimeout(searchTimeout);
                    if (this.value !== value) this.value = value;
                    if (typeof this.handler === 'function') {
                        this.handler(value, !!autoSearch);
                    } else {
                        console.log('You need to set a search handler function on this.$byu.search.handler. Searched for "' +
                            value + '"' + (autoSearch ? ' using debounced auto search' : ''));
                    }
                }
            };
            Object.defineProperties(byu.search, {
                disabled: {
                    get: () => typeof store.state.byu.searchHandler !== 'function',
                },

                handler: {
                    get: () => store.state.byu.searchHandler,
                    set(value) {
                        clearTimeout(searchTimeout);
                        store.commit('byu/searchHandlerUpdate', value);
                    }
                },

                value: {
                    get: () => store.state.byu.searchValue,
                    set(value) {
                        clearTimeout(searchTimeout);
                        store.commit('byu/searchValueUpdate', value);

                        const handler = this.handler;
                        const debounce = handler && handler.hasOwnProperty('debounce')
                            ? handler.debounce
                            : site.searchDebounce;

                        if (debounce > 0) {
                            searchTimeout = setTimeout(() => this.submit(value, true), debounce);
                        }
                    }
                }
            });

            app.$byu = byu;

            Object.defineProperty(Vue.prototype, '$byu', {
                configurable: true,
                value: byu
            });
        }
    });

}


let firstRouteEnter = true;

function routeEnter(vm, to, from) {

    const titleCreator = vm.$options.pageTitle;
    if (typeof titleCreator === 'function') {
        const previous = firstRouteEnter
            ? site.pageTitle
            : vm.$store.state.byu.pageTitle;
        const newTitle = titleCreator.call(vm, { to, from, previous });
        vm.$store.commit('byu/updateTitle', newTitle);
    } else {
        vm.$store.commit('byu/updateTitle', site.pageTitle);
    }

    const searchCreator = vm.$options.pageSearch;
    if (typeof searchCreator === 'function') {
        const previous = firstRouteEnter
            ? site.searchHandler
            : vm.$byu.search.handler;
        const newSearch = searchCreator.call(vm, { to, from, previous });
        vm.$byu.search.handler = typeof newSearch === 'function' ? newSearch : null;
    } else {
        vm.$byu.search.handler = site.searchHandler;
    }
    vm.$byu.search.value = '';

    const navCreator = vm.$options.navigationMenu;
    if (typeof navCreator === 'function') {
        const previous = firstRouteEnter
            ? site.navigationLinks
            : vm.$store.state.byu.navigationLinks;
        const newLinks = navCreator.call(vm, { to, from, previous });
        vm.$store.commit('byu/updateNavigation', newLinks);
    } else {
        vm.$store.commit('byu/updateNavigation', site.navigationLinks);
    }

    firstRouteEnter = false;
}