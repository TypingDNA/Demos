'use strict';

const typingDnaClient = global.typingDnaClient;

const final = {
    /** GET final page. */
    get: function(req, res) {
        /** Check session variables for the last authentication result and display them. */
        if(!req.session ||
            !req.session.data ||
            !req.session.data.internalUserId) {
            return res.redirect('index')
        }
        let sessionData = req.session.data;
        const loggedIn = sessionData.typingResult === 1;
        const { lastResult, wrongPassword, isNewUser, device } = sessionData;
        const messages = Object.assign({},sessionData.messages);
        let patternCount = sessionData.patternCount || 0;
        let resultColour = global.config.options.scoreColor.low;
        /** displays if autoenroll happened in the background */
        let showEnroll = 0;
       
        /** display result info based on score */
        if (lastResult && lastResult.score && loggedIn) { 
            if (lastResult.score >= config.options.scoreThreshold.high) {
                showEnroll = lastResult.score >= global.config.options.autoEnrollThreshold;
                patternCount += showEnroll ? 1 : 0;
                resultColour = global.config.options.scoreColor.high;
            } else {
                resultColour = global.config.options.scoreColor.medium;
            }
        }
        
        /** transform confidence number in descriptive confidence */
        let confidence = 'Low';
        if (lastResult !== undefined) {
            if (lastResult.confidence > global.config.options.confidence.high) {
                confidence = 'High';
            }
            else if (lastResult.confidence > global.config.options.confidence.medium) {
                confidence = 'Medium';
            }
        }

        res.render('final', {
            title: 'Final - TypingDNA',
            sid:req.sessionID,
            loggedIn,
            wrongPassword,
            lastResult,
            messages,
            isNewUser,
            patternCount,
            device,
            confidence,
            showEnroll,
            resultColour,
        });
    },

    /** POST final page. */
    post: function(req, res) {
        if(!req.session ||
            !req.session.data||
            !req.session.data.internalUserId) {
            return res.redirect('index')
        }
        let sessionData = req.session.data;
        const sessionUserId = sessionData.internalUserId;

        const loggedIn = sessionData.typingResult === 1;
        if(loggedIn) {
            /** user is logged in, save the typing pattern */
            if(sessionData.typingPattern) {
                typingDnaClient.save(
                    sessionUserId,
                    sessionData.typingPattern,
                    (err) => {
                        if(err) {
                            return functions.displayError(req, res, {clearSession: true, message: 'Error saving user data.'});
                        }
                        req.session.data = {};
                        req.session.save(() => {
                            return res.redirect('index');
                        })
                    })
            } else {
                return functions.displayError(req, res, {clearSession: true, message: 'Error saving user data.'});
            }
        } else {
            /** User is not logged in, reset user data */
            const params = {
                userId: sessionUserId,
                device: sessionData.device,
                type: 1
            };
            typingDnaClient.delete(params, function(err) {
                if(err) {
                    return functions.displayError(req, res, {clearSession: true, message: 'Error resetting user data.'});
                }
                req.session.data = {};
                req.session.save(() => {
                    return res.redirect('index');
                })
            })
        }
    }
};

module.exports = final;
