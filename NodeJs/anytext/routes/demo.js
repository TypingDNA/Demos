'use strict';

var index = require('../controllers/index');
var verify = require('../controllers/verify');
var enroll = require('../controllers/enroll');
var final = require('../controllers/final');

function initSessionVars() {
    return function(req, res, next) {
        if(!req.session.data) {
            req.session.data = {};
        }
        if(!req.session.data.messages || !req.session.data.messages.errors) {
            req.session.data.messages = {};
            req.session.data.messages.errors =  [];
        }
        next();
    }
}

module.exports = function(app){
    app.use(initSessionVars());
    app.get('/', index.get);
    app.post('/', index.post);
    app.get('/index', index.get);
    app.post('/index', index.post);
    app.get('/enroll', enroll.get);
    app.post('/enroll', enroll.post);
    app.get('/verify', verify.get);
    app.post('/verify', verify.post);
    app.get('/final', final);
};