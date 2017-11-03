'use strict';

var typingDnaClient = global.typingDnaClient;

var final = {
    /** GET final page. */
    get: function(req, res) {
        /** Check session variables for the last authentication result and display them. */
        if(!req.session ||
            !req.session.data ||
            !req.session.data.internalUserId) {
            return res.redirect('index')
        }
        var sessionData = req.session.data;
        var loggedIn = sessionData.typingResult === 1;
        var debug = parseInt(req.query.debug) || 0;
        var lastResult = sessionData.lastResult;
        var wrongPassword = sessionData.wrongPassword;
        var isNewUSer = sessionData.isNewUser;
        var messages = Object.assign({},sessionData.messages);
        var diagramCount = sessionData.diagramCount || 0;
        var device = sessionData.device;
        res.render('final', {
            title: 'Final - TypingDNA',
            sid:req.sessionID,
            loggedIn: loggedIn,
            wrongPassword: wrongPassword,
            displayDebug:debug,
            lastResult: lastResult,
            messages: messages,
            isNewUser: isNewUSer,
            diagramCount: diagramCount,
            device: device
        });
    },

    /** POST final page. */
    post: function(req, res) {
        if(!req.session ||
            !req.session.data||
            !req.session.data.internalUserId) {
            return res.redirect('index')
        }
        var sessionData = req.session.data;
        var sessionUserId = sessionData.internalUserId;

        var loggedIn = sessionData.typingResult === 1;
        if(loggedIn) {
            /** user is logged in, save the diagram */
            if(sessionData.diagram) {
                typingDnaClient.save(
                    sessionUserId,
                    sessionData.diagram,
                    function(err) {
                        if(err) {
                            return functions.displayError(req, res, {clearSession: true, message: 'Error saving user data.'});
                        }
                        req.session.data = {};
                        req.session.save(function() {
                            return res.redirect('index');
                        })
                    })
            } else {
                return functions.displayError(req, res, {clearSession: true, message: 'Error saving user data.'});
            }
        } else {
            /** User is not logged in, reset user data */
            var params = {
                userId: sessionUserId,
                device: sessionData.device,
                type: 'diagram'
            };
            typingDnaClient.delete(params, function(err) {
                if(err) {
                    return functions.displayError(req, res, {clearSession: true, message: 'Error resetting user data.'});
                }
                req.session.data = {};
                req.session.save(function() {
                    return res.redirect('index');
                })
            })
        }
    }
};

module.exports = final;
