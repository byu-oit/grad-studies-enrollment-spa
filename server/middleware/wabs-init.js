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
const config        = require('../../config');
const cookieParser  = require('cookie-parser');

module.exports = function (wabs) {
    const cookies = cookieParser(config.cookieSecret);
    const wabsInit = wabs.init();
    const rx = /^\/([^\/$]*)/;
    return (req, res, next) => {
        const match = rx.exec(req.path);
        switch (match[1]) {
            // routes not to run through wabs init
            case '_nuxt':
            case '__webpack_hmr':
                next();
                break;

            // everything else through wabs init
            default:
                cookies(req, res, err => {
                    if (err) return next(err);
                    wabsInit(req, res, next);
                });
        }
    };
};