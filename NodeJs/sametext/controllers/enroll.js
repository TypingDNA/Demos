const enroll = {
    /** GET enroll page. */
    get: function (req, res) {
        /** If there is no session data redirect to index */
        if (!req.session || !req.session.data || !req.session.data.internalUserId) {
            return res.redirect(303, 'index');
        }
        let sessionData = req.session.data;
        if (typeof sessionData.enrollPatterns === 'undefined') {
            sessionData.enrollPatterns = [];
        }

        const messages = Object.assign({}, sessionData.messages);
        sessionData.messages = null;

        /** If we have more than 3 stored typing patterns enrollments process is over. */
        if (sessionData.enrollPatterns.length >= 3) {
            return res.render('enroll', {
                title: 'Enroll new user - TypingDNA',
                sid: req.sessionID,
                finish: sessionData.enrollPatterns.length >= 3,
                messages
            });
        }

        res.render('enroll', {
            title: 'Enroll new user - TypingDNA',
            sid: req.sessionID,
            currentQuote: global.config.sametext,
            finish: sessionData.enrollPatterns.length >= 3,
            messages,
            step: sessionData.enrollPatterns.length + 1,
        });
    },

    /** POST enroll page. */
    post: function (req, res) {
        let sessionData = req.session.data;
        /** Verify if post body contains the typing pattern, if not display error message. */
        if (!req.body.tp) {
            return functions.displayError(req, res, { clearSession: true, message: 'Invalid typing pattern.' });
        }
        if (typeof sessionData.enrollPatterns === 'undefined') {
            sessionData.enrollPatterns = [];
        }
        /** Store the typing pattern in a session variable */
        sessionData.enrollPatterns.push(req.body.tp);

        req.session.save(async () => {
            /** If there are more than 3 stored typing patterns save them */
            if (sessionData.enrollPatterns.length >= 3) {
                const { error, result } = await functions.doAuto(sessionData.internalUserId, sessionData.enrollPatterns.join(';'));

                if (error || !result || result.enrollment !== 1) {
                    sessionData.enrollPatterns = [];
                    sessionData.messages.errors.push({ param: 'userId', msg: 'Error enrolling user' });
                }
                /** Typing patterns are saved. */
                return req.session.save(() => {
                    res.redirect(303, 'enroll');
                })
            } else {
                return req.session.save(() => {
                    res.redirect(303, 'enroll');
                })
            }
        })
    }
};

module.exports = enroll;
