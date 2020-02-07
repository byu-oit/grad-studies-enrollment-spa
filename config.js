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
const pkg           = require('./package');
const WebResource   = require('./WebResource')

const config = {
    // the secret to use to sign cookies
    cookieSecret: 'this needs to be changed',

    // the server host
    host: process.env.HOST || '0.0.0.0',

    // the port to run the server on
    port: process.env.PORT || 8460,

    // whether in production mode or not
    production: process.env.NODE_ENV === 'production',

    // site default settings
    site: {

        // default site navigation links
        navigationLinks: [
            // { href: '/', title: 'By Year' },
            // { href: '/college', title: 'By College' },
            // { href: '/department', title: 'By Department' },
            // { href: '/program', title: 'By Program' }
        ],

        // default site title (in title bar)
        pageTitle: { pre: '', main: 'Graduate Studies Enrollment', post: '' },

        // how many milliseconds to wait before performing an automatic search - set to zero (0) to disable
        searchDebounce: 350,

        // default search functionality - set to null to disable
        searchHandler: WebResource,

        // default browser page title (modification requires rebuild)
        title: 'BYU | Graduate Studies Enrollment'
    },

    // the WABS configuration: https://www.npmjs.com/package/byu-wabs#create-a-wabs-configuration
    wabs: {
        appName: pkg.name,
        awsParameterName: process.env.IN_DEV ? "grad-studies-enrollment.LOCAL" : null
    }
};

module.exports = config;
