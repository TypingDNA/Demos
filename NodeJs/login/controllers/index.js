var functions = require('../resources/functions');
var typingDnaClient = global.typingDnaClient;

var index = {
    /** GET home page. */
    get: function(req, res) {
        /** If there are any messages in the session display them. */
        var messages = Object.assign({},req.session.data.messages);
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
            messages: messages
        });
    },

    /** POST home page. */
    post: function(req, res) {
        var sessionData = req.session.data;
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
        var typing_pattern = req.body['diagram'];
        var isMobile = functions.isMobile(req.headers['user-agent']);
        sessionData.device = isMobile ? 'mobile' : 'desktop';

        /** Check if the user has previous saved typing patterns */
        typingDnaClient.check(
            {
                userId: sessionData.internalUserId,
                textId: sessionData.textId,
                device: isMobile ? 'mobile' : 'desktop',
                type: ['diagram', 'extended']
            },
            function(error, result) {
                if(error || result['count'] === undefined || result['success'] === 0) {
                    return functions.displayError(
                        req,
                        res,
                        {clearSession: true, message: 'Error checking user' + (result['message'] ? ': ' + result['message'] : '.')});
                }
                if(result['count'] === 0 && result['mobilecount'] === 0) {
                    req.session.isNewUser = true;
                }
                /** If thus is a mobile device check the mobilecount parameter. */
                if(isMobile) {
                    result['count'] = result['mobilecount'];
                }
                if(result['success'] === 1) {
                    /** If the user has previous patterns verify the current pattern */
                    if(result['count'] > 0) {
                        /** The user is enrolled with the same textId */
                        sessionData.wrongPassword = false;
                        sessionData.diagramCount = result['count'];
                        /** Verifying user diagram */
                        typingDnaClient.verify(sessionData.internalUserId, typing_pattern, req.body.quality || 2,
                            function(error, result) {
                                sessionData.lastResult = result;
                                if(error || result['statusCode'] !== 200 || result['success'] === 0) {
                                    return functions.displayError(req, res,
                                        {clearSession: true, message: 'Error verifying user.'});
                                }
                                sessionData.typingResult = result['result'];
                                if(result['result'] === 1) {
                                    sessionData.diagram = typing_pattern;
                                }
                                /** We have the verification result redirect to final step */
                                return  req.session.save(function(){
                                    res.redirect('final');
                                })
                            })
                    }else {
                        /**
                         * The user does not have previously saved typing pattern for this textId
                         * check if he has patterns with other textIs
                         */
                        typingDnaClient.check({
                                userId : sessionData.internalUserId,
                                device: isMobile? 'mobile' : 'desktop',
                                type: ['diagram']
                            },
                            function(error, result) {
                                if(error || result['count'] === undefined || result['success'] === 0) {
                                    return functions.displayError(req, res,
                                        {clearSession: true, message: 'Error verifying user.'});
                                }
                                if(result['count'] === 0 && result['mobilecount'] === 0) {
                                    req.session.isNewUser = true;
                                }
                                var patternCount = result['count'];
                                if(isMobile) {
                                    patternCount = result['mobilecount'];
                                }
                                if(result.success === 1) {
                                    if(patternCount > 0) {
                                        /** The user has previous enrollments with another password */
                                        sessionData.wrongPassword = true;
                                        return  req.session.save(function(){
                                            res.redirect('final');
                                        })
                                    } else {
                                        /** The user is new and has no previous patterns,
                                         *  save current pattern (enroll user)
                                         * */
                                        typingDnaClient.save(
                                            sessionData.internalUserId,
                                            typing_pattern,
                                            function(err,result) {
                                                if(err || (result && result['success'] === 0)) {
                                                    return functions.displayError(req, res,
                                                        {clearSession: true, message: 'Error saving user data.'
                                                        });
                                                }
                                                sessionData.isNewUser = true;
                                                return req.session.save(function() {
                                                    res.redirect(303, 'final');
                                                })
                                            })
                                    }
                                }
                            })
                    }
                } else {
                    return functions.displayError(req, res, {clearSession: true, message: 'Error verifying user.'});
                }
        })
    }
};

module.exports = index;
