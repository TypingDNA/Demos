const index = require('../controllers/index');
const verify = require('../controllers/verify');
const enroll = require('../controllers/enroll');
const final = require('../controllers/final');

function initSessionVars() {
    return (req, res, next) => {
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

module.exports = app => {
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