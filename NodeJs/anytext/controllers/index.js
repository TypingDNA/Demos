'use strict';

const functions = require('../resources/functions');
const typingDnaClient = global.typingDnaClient;

const index = {
    /** GET home page. */
    get: function(req, res) {
        /** If there are any messages in the session display them. */
        const messages = Object.assign({},req.session.data.messages);
        /** Reset session user data */
        if(req.session) {
            req.session.data = {
                typingResult : 0,
                typingFailedAttempts: 0,
                internalUserId : null,
                isNewUser: false,
                messages: {
                    errors: []
                }
            }
        }
        /** Render the page */
        res.render('index', {
            title: 'Demo - TypingDNA',
            sid: req.sessionID,
            messages
        });
    },

    /** POST home page. */
    post: function(req, res) {
        let sessionData = req.session.data;
        /** Verify if post body contains the user email, if not redirect to index */
        if(typeof req.body['username'] === 'undefined') {
            return functions.displayError(req, res, {clearSession: true, message: 'Invalid user email.'});
        }
        /**
         * Generate a user id based on the user email/id and keep it in the session
         * DO NOT pass it to the browser, you will use the sessionData.internalUserId to enroll/verify the user
         */
        sessionData.internalUserId = functions.getInternalUserId(req.body.username);
        const isMobile = global.functions.isMobile(req.headers['user-agent']);
        sessionData.device = isMobile ? 'mobile' : 'desktop';

        /** Check if the user has previous saved typing patterns */
        functions.doCheckUser({
            userId: sessionData.internalUserId,
            type: [0, 2],
            isMobile,
        }).then((result) => {
            if(result['count'] === undefined || result['success'] === 0) {
                return functions.displayError(
                    req,
                    res,
                    {clearSession: true, message: 'Error checking user' + (result['message'] ? ': ' + result['message'] : '.')});
            }
            if(result['count'] === 0) {
                req.session.isNewUser = true;
            }
            if(result['success'] === 1) {
                sessionData.patternCount = result['count'];
                req.session.save(() => {
                    if(result.count > 0) {
                        /** User is already enrolled, redirect to verify. */
                        res.redirect('verify')
                    } else {
                        /** The user is not enrolled yet, redirect to enroll. */
                        res.redirect('enroll')
                    }
                })
            }
        }).catch((error) => {
            return functions.displayError(
                req,
                res,
                {clearSession: true, message: 'Error checking user.'}
            );
        });
    }
};

module.exports = index;
