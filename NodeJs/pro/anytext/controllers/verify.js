'use strict';

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

        /** If the previous authentication failed, join the two typing patterns and sed them both for a better accuracy. */
        if(sessionData.lastTp) {
            typing_pattern +=';'+ sessionData.lastTp;
        }

        /** Verify typing pattern(s) */
        typingDnaClient.verify(sessionData.internalUserId, typing_pattern, req.body.quality || 2, (error, result) => {
            sessionData.lastResult = result;
            if(error || result['statusCode'] !== 200) {
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

            if(result['score'] < global.config.options.scoreThreshold.medium) {
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
                if (result['score'] > global.config.options.autoEnrollThreshold) {
                    // if score exceeds threshold, save pattern (auto-enroll)
                    typingDnaClient.save(
                        sessionData.internalUserId,
                        typing_pattern,
                        (err,result) => {
                            if(err || (result && result['success'] === 0)) {
                                return functions.displayError(req, res,
                                    {clearSession: true, message: 'Error saving user data.'
                                    });
                            }
                            return req.session.save(() => {
                                res.redirect('final');
                            })
                        })
                } else {
                    return  req.session.save(() => {
                        res.redirect('final');
                    });
                }
            }
        })
    }
};

module.exports = verify;
