function hasMaxAttempts(req) {
    if (!req.session.data.typingFailedAttempts) {
        req.session.data.typingFailedAttempts = 0;
    }
    return req.session.data.typingFailedAttempts >= 2;
}

const verify = {
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
        const messages = Object.assign({}, sessionData.messages);
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
    post: async function (req, res) {
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
        const { error, result } = await functions.doAuto(sessionData.internalUserId, sessionData.lastTp);

        sessionData.lastResult = result;
        if (error || !result || result.statusCode !== 200) {
            sessionData.messages.errors.push({ param: 'userId', msg: 'Error checking typing pattern' });
            return req.session.save(function () {
                res.redirect(303, 'verify');
            })
        }

        /** If the result returns success 0 then there are no previous saved patterns */
        if (result.messageCode !== 1) {
            return req.session.save(function () {
                res.redirect(303, 'enroll');
            })
        }

        if (result.result !== 1) {
            /** If score is lower than the threshold, then the authentication failed
             *  we store the typing pattern in a session variable and retry
             *  authentication once again (dualpass).
             */
            sessionData.verify_step++;
            sessionData.typingFailedAttempts++;
            sessionData.lastTp = typing_pattern;
            sessionData.isDualPass = true;
            return req.session.save(function () {
                res.redirect('verify');
            })
        } else {
            /** Typing pattern authentication succeeded, redirect to final. */
            return req.session.save(() => {
                res.redirect('final');
            });
        }
    }
};

module.exports = verify;
