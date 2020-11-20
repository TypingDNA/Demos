'use strict';

const async = require('async');
const typingDnaClient = global.typingDnaClient;

const enroll = {
    /** GET enroll page. */
    get: function(req, res)  {
        /** If there is no session data redirect to index */
        if(!req.session || !req.session.data ||!req.session.data.internalUserId) {
            return res.redirect(303,'index');
        }
        let sessionData = req.session.data;
        if(typeof sessionData.enrollPatterns === 'undefined') {
            sessionData.enrollPatterns = [];
        }

        const messages = Object.assign({}, sessionData.messages);
        sessionData.messages = null;

        /** If we have more than 2 stored typing patterns enrollments process is over. */
        if(sessionData.enrollPatterns.length >= 2) {
            return res.render('enroll', {
                title: 'Enroll new user - TypingDNA',
                sid:req.sessionID,
                finish: sessionData.enrollPatterns.length >= 2,
                messages: messages
            });
        }

        /** We have less than 2 typing patterns, gat a new quote(text) and render the page. */
        typingDnaClient.getQuote(160, 180, function(error, result) {
            res.render('enroll', {
                title: 'Enroll new user - TypingDNA',
                sid:req.sessionID,
                currentQuote: result.quote,
                author: result.author,
                finish: sessionData.enrollPatterns.length >= 2,
                messages: messages,
                step: sessionData.enrollPatterns.length + 1
            });
        });
    },

    /** POST enroll page. */
    post: function(req, res)  {
        let sessionData = req.session.data;
        /** Verify if post body contains the typing pattern, if not display error message. */
        if(!req.body.tp) {
            return functions.displayError(req, res, {clearSession: true, message: 'Invalid typing pattern.'});
        }
        if(typeof sessionData.enrollPatterns === 'undefined') {
            sessionData.enrollPatterns = [];
        }
        /** Store the typing pattern in a session variable */
        sessionData.enrollPatterns.push(req.body.tp);

        req.session.save(() => {
            /** If there are more than 2 stored typing patterns save them */
            if(sessionData.enrollPatterns.length >= 2) {
                const asyncTasks = [];
                for(let i =0 ; i < sessionData.enrollPatterns.length; i++) {
                    let userId = sessionData.internalUserId;
                    let userTp = sessionData.enrollPatterns[i];
                    asyncTasks.push((callback) => {
                        /** Save the typing patterns by making for each a save call */
                        typingDnaClient.save(
                            userId,
                            userTp,
                            function(err,result) {
                                if(err || (result && result.success === 0)) {
                                    return callback(new Error('Error inserting data'));
                                }
                                callback();
                            })
                    })
                }
                /** Run async both save calls */
                async.parallel(asyncTasks, (err) => {
                    if(err) {
                        sessionData.enrollPatterns = [];
                        sessionData.messages.errors.push({param: 'userId', msg:'Error enroling user'});
                    }
                    /** Typing patterns are saved. */
                    return  req.session.save(() => {
                        res.redirect(303,'enroll');
                    })
                });
            } else {
                return  req.session.save(() => {
                    res.redirect(303,'enroll');
            })
            }
        })
    }
};

module.exports = enroll;
