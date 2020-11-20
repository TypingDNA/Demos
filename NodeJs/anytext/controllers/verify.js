'use strict';

const functions = require("../resources/functions");

const typingDnaClient = global.typingDnaClient;

function hasMaxAttempts(req) {
    if(!req.session.data.typingFailedAttempts) {
        req.session.data.typingFailedAttempts = 0;
    }
    return req.session.data.typingFailedAttempts >= 2
}

const verify = {
    /** GET verify page */
    get: function(req, res) {
        /** If there is no session data redirect to index */
        if(!req.session || !req.session.data || !req.session.data.internalUserId) {
            return res.redirect('index');
        }
        let sessionData = req.session.data;

        /** Check if the user has exceeded the maximum number of failed authentications */
        if(hasMaxAttempts(req)) {
            return res.redirect('final');
        }
        if(!sessionData.verify_step) {
            sessionData.verify_step = 1;
        }
        const { typingFailedAttempts: attempts, lastResult } = sessionData;

        const messages = Object.assign({}, sessionData.messages);
        sessionData.messages = null;

        /** Render the page */
        typingDnaClient.getQuote(attempts > 0 ? 75:130, attempts > 0 ? 85:140, (error, result) => {
            res.render('verify', {
                title: 'Verify user - TypingDNA',
                sid:req.sessionID,
                currentQuote:result['quote'],
                author:result['author'],
                verify_step:sessionData.verify_step,
                attempts: attempts,
                lastResult: lastResult,
                messages: messages
            });
        })
    },

    /** POST verify page. */
    post: function(req, res) {
        /** If there is no session data redirect to index */
        if(!req.session || !req.session.data ||!req.session.data.internalUserId) {
            return res.redirect('index');
        }
        /** Check if the user has exceeded the maximum number of failed authentications */
        if(hasMaxAttempts(req)) {
            return res.redirect('final');
        }
        let typing_pattern = req.body.tp;
        let sessionData = req.session.data;

        /** Verify if post body contains the typing pattern, if not display error message. */
        if(!typing_pattern) {
            sessionData.messages.errors.push({param: 'userId', msg:'Invalid typing pattern'});
            return  req.session.save(() => {
                res.redirect(303,'verify');
            })
        }

        /** If the previous authentication failed, join the two typing patterns and send them both for a better accuracy. */
        if(sessionData.lastTp) {
            typing_pattern +=';'+ sessionData.lastTp;
        }

        functions.doAuto(sessionData.internalUserId, typing_pattern)
            .then((result) => {
                sessionData.lastResult = result;
                if(result['statusCode'] !== 200) {
                    sessionData.messages.errors.push({param: 'userId', msg:'Error checking typing pattern'});
                    return  req.session.save(() => {
                        res.redirect(303,'verify');
                    })
                }

                /** If the result returns success 0 then there are no previous saved patterns */
                if(result['success'] === 0) {
                    return  req.session.save(() => {
                        res.redirect(303, 'enroll');
                    })
                }

                if(result.result === 0) {
                    /** If result is lower than the threshold, then the authentication failed, we store the typing pattern in a session variable and retry
                     * authentication with another text.
                     */
                    sessionData.verify_step ++;
                    sessionData.typingResult = 0;
                    sessionData.typingFailedAttempts++;
                    sessionData.lastTp = typing_pattern;
                    return  req.session.save(() => {
                        res.redirect('verify');
                    })
                } else {
                    /** Typing pattern authentication succeeded, redirect to final. */
                    sessionData.typingResult = 1;
                    return  req.session.save(() => {
                        res.redirect('final');
                    });
                }
            })
            .catch(() => {
                sessionData.messages.errors.push({param: 'userId', msg:'Error checking typing pattern'});
                return  req.session.save(() => {
                    res.redirect(303,'verify');
                })
            });
    }
};

module.exports = verify;
