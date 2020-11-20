'use strict';

const server = require('light-http-server');
const path = require('path');

global.config = require('./resources/config');

/** Initialize TypingDnaClient. The client will make the API requests. */
const TypingDnaClient = require('typingdnaclient');
global.typingDnaClient = new TypingDnaClient(
    global.config.typingDNA.apiKey,
    global.config.typingDNA.apiSecret,
    global.config.typingDNA.apiServer);

global.functions = require('./resources/functions');

/**
 * View engine setup
 */
server.set('views', './views');
server.set('view engine', 'pug');
server.set('static', path.join(__dirname,'public'));
server.set('session', {
    lifetime:604800,
    secret:config.sessionSecret
});


/**
 *  Ensure that the page is not cached
 */
server.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

/**
 *  Get request fields from url and body
 */
server.use(function(req, res, next) {
    functions.getRequestFields(req,{},function(){
        next();
    })
});

/**
 * Load the main routes
 */
require('./routes/demo')(server);

/**
 * Catch 404 and forward to error handler
 */
server.use(function(req, res) {
    res.status(404);
    res.send('Page not found')

});

module.exports = server;
