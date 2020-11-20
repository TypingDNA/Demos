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
                wrongPassword: false,
                messages: {
                    errors: [],
                    info: [],
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
    post: async function(req, res) {
        let sessionData = req.session.data;
        /** Verify if post body contains the user email, if not redirect to index */
        if(typeof req.body['username'] === 'undefined') {
            return functions.displayError(req, res, {clearSession: true, message: 'Invalid user email.'});
        }

        /**
         * Generate a user id based on the user email/id and keep it in the session
         * DO NOT pass it to the browser, you will use the sessionData.internalUserId to enroll/verify the user
         */
        sessionData.internalUserId = functions.getInternalUserId(req.body['username'], global.config.someprivatekey);
        sessionData.textId = req.body['textid'];
        const typing_pattern = req.body['typingPattern'];
        const isMobile = functions.isMobile(req.headers['user-agent']);
        sessionData.device = isMobile ? 'mobile' : 'desktop';

       
        try {
            /** check if user is enrolled with this user & password */
            const { count, success, message } = await functions.doCheckUser({
                userId: sessionData.internalUserId, textId: sessionData.textId, type: 1, isMobile
            });
            if (success === 0 || count === undefined) {
                return functions.displayError(req, res,
                    { clearSession: true, message: 'Error checking user' + (message ? ': ' + message : '.')});
            }
            
            if (count === 0) {
                /** check if user is already enrolled with another password */
                const { count, success, message }  = await functions.doCheckUser({
                    userId: sessionData.internalUserId, type: 1, isMobile
                });
                if (success === 0 || count === undefined) {
                    return functions.displayError(req, res,
                        { clearSession: true, message: 'Error checking user' + (message ? ': ' + message : '.')});
                }
                sessionData.enrollments = count;
                if (count === 0) {
                    /** user is new => do /auto */
                    sessionData.isNewUser = true;
                    const result = await functions.doAuto(sessionData.internalUserId, typing_pattern);
                    if (result.status > 200) {
                        return functions.displayError(req, res, { message: result.message });
                    }
                    sessionData.lastResult = result;
                    res.redirect('/final');
                } else {
                    /** user has previous enrollments with another password */
                    sessionData.wrongPassword = true;
                    res.redirect('final');
                }
            } else {
                /** user & pass are correct => do /auto */
                sessionData.enrollments = count;
                const result = await functions.doAuto(sessionData.internalUserId, typing_pattern);
                if (result.status > 200) {
                    return functions.displayError(req, res, { message: result.message });
                }
                sessionData.lastResult = result;
                res.redirect('/final');
            }
        } catch (error) {
            return functions.displayError(req, res,
                { clearSession: true, message: 'Error checking user' + (error['message'] ? ': ' + error['message'] : '.')});
        }
    }
};

module.exports = index;
