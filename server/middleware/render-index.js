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
const config                = require('../../config');
const nuxtConfig            = require('../../nuxt.config');
const { Nuxt, Builder }     = require('nuxt');

module.exports = function (wabs) {
    // init Nuxt
    const nuxt = new Nuxt(nuxtConfig);

    // build only in dev mode
    if (!config.production) new Builder(nuxt).build();

    // wabs brownie middleware (filter to extensionless paths)
    const brownie = wabs.brownie();

    // wabs sync middleware
    const sync = wabs.sync();

    return (req, res, next) => {
        if (req.wabs && !/\.\w+$/.test(req.path)) {
            brownie(req, res, err => {
                if (err) return next(err);
                sync(req, res, err => {
                    if (err) return next(err);
                    nuxt.render(req, res, next);
                });
            });
        } else {
            nuxt.render(req, res, next);
        }
    };
};
