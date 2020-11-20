'use strict';

var typingDnaClient = global.typingDnaClient;

function hasMaxAttempts(req) {
    if (!req.session.data.typingFailedAttempts) {
        req.session.data.typingFailedAttempts = 0;
    }
    return req.session.data.typingFailedAttempts >= 2
}

var verify = {
    /** GET verify page */
    get: function (req, res) {
        /** If there is no session data redirect to index */
        if (!req.session || !req.session.data || !req.session.data.internalUserId) {
            return res.redirect('index');
        }
        let sessionData = req.session.data;

        /** Check if the user has exceeded the maximum number of failed authentications */
        if (hasMaxAttempts(req)) {
            return res.redirect('final');
        }
        if (!sessionData.verify_step) {
            sessionData.verify_step = 1;
        }
        var messages = Object.assign({}, sessionData.messages);
        sessionData.messages = null;

        /** Render the page */
        res.render('verify', {
            title: 'Verify user - TypingDNA',
            sid: req.sessionID,
            currentQuote: global.config.sametext,
            verify_step: sessionData.verify_step,
            attempts: sessionData.typingFailedAttempts,
            lastResult: sessionData.lastResult,
            messages
        });
    },

    /** POST verify page. */
    post: function (req, res) {
        /** If there is no session data redirect to index */
        if (!req.session || !req.session.data || !req.session.data.internalUserId) {
            return res.redirect('index');
        }
        /** Check if the user has exceeded the maximum number of failed authentications */
        if (hasMaxAttempts(req)) {
            return res.redirect('final');
        }
        const typing_pattern = req.body.tp;
        let sessionData = req.session.data;

        /** Verify if post body contains the typing pattern, if not display error message. */
        if (!typing_pattern) {
            sessionData.messages.errors.push({ param: 'userId', msg: 'Invalid typing pattern' });
            return req.session.save(function () {
                res.redirect(303, 'verify');
            })
        }

        /** If the previous authentication failed, join the two typing patterns and sed them both for a better accuracy. */
        if (sessionData.lastTp && sessionData.lastTp.length > 0) {
            sessionData.lastTp += ';' + typing_pattern;
        } else {
            sessionData.lastTp = typing_pattern;
        }

        /** Verify typing pattern(s) */
        typingDnaClient.verify(sessionData.internalUserId, sessionData.lastTp, req.body.quality || 2, (error, result) => {
            sessionData.lastResult = result;
            if (error || result['statusCode'] !== 200) {
                sessionData.messages.errors.push({ param: 'userId', msg: 'Error checking typing pattern' });
                return req.session.save(function () {
                    res.redirect(303, 'verify');
                })
            }

            /** If the result returns success 0 then there are no previous saved patterns */
            if (result['success'] === 0) {
                return req.session.save(function () {
                    res.redirect(303, 'enroll');
                })
            }

            if (result['score'] < global.config.options.scoreThreshold.medium) {
                /** If score is lower than the threshold, then the authentication failed
                 *  we store the typing pattern in a session variable and retry
                 *  authentication once again (dualpass).
                 */
                sessionData.verify_step++;
                sessionData.typingResult = 0;
                sessionData.typingFailedAttempts++;
                sessionData.lastTp = typing_pattern;
                sessionData.isDualPass = true;
                return req.session.save(function () {
                    res.redirect('verify');
                })
            } else {
                /** Typing pattern authentication succeeded, redirect to final. */
                sessionData.typingResult = 1;
                if (result['score'] > global.config.options.autoEnrollThreshold && !sessionData.isDualPass) {
                    /** if score exceeds autoenroll threshold & didn't come from dualpass (retry after failure), save pattern (auto-enroll) */
                    typingDnaClient.save(
                        sessionData.internalUserId,
                        typing_pattern,
                        (err,result) => {
                            if (err || (result && result['success'] === 0)) {
                                return functions.displayError(req, res,
                                    {
                                        clearSession: true, message: 'Error saving user data.'
                                    });
                            }
                            return req.session.save(() => {
                                res.redirect('final');
                            })
                        })
                } else {
                    return req.session.save(() => {
                        res.redirect('final');
                    })
                }
            }
        })
    }
};

module.exports = verify;
