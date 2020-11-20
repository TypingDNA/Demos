'use strict';

const index = require('../controllers/index');
const final = require('../controllers/final');

function initSessionVars() {
    return (req, res, next) => {
        if(!req.session.data) {
            req.session.data = {};
        }
        if(!req.session.data.messages) {
            req.session.data.messages = {};
        }
        if(!req.session.data.messages.errors) {
            req.session.data.messages.errors =  [];
        }
        if(!req.session.data.messages.info) {
            req.session.data.messages.info =  [];
        }
        next();
    }
}

module.exports = app => {
    app.use(initSessionVars());
    app.get('/', index.get);
    app.post('/', index.post);
    app.get('/index', index.get);
    app.post('/index', index.post);
    app.get('/final', final.get);
    app.post('/final', final.post);
};