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
const api       = require('./api');
const config    = require('../config');
const express   = require('express');
const init      = require('./middleware/wabs-init');
const render    = require('./middleware/render-index');
const Wabs      = require('byu-wabs');

const wabs = Wabs(config.wabs);

// create express app
const app = express();
app.use((req, res, next) => {
    console.log(req.method + ' ' + req.originalUrl);
    next();
});

app.get('/healthcheck', function (req, res) {
    res.send('Alive and well!')
});

// run cookie parser and wabs init for some paths
app.use(init(wabs));

// import API routes
app.use('/api', api);

// serve static content and index.html
app.use(render(wabs));

// start server listening on port
const listener = app.listen(config.port, config.host, err => {
    if (err) {
        console.error(err.stack);
        process.exit(1);
    }
    console.log('Server listening on ' + config.host + ':' + config.port)
});

function stop() {
  listener.close();
  process.exit(0);
}

process.on('exit', stop)      // app is closing
process.on('SIGINT', stop)    // catches ctrl+c event
process.on('SIGBREAK', stop)  // catches Windows ctrl+c event
process.on('SIGUSR1', stop)   // catches "kill pid"
process.on('SIGUSR2', stop)   // catches "kill pid"
