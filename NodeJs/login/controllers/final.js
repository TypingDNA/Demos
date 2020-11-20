'use strict';

const typingDnaClient = global.typingDnaClient;

const final = {
    /** GET final page. */
    get: async function(req, res) {
        /** Check session variables for the last authentication result and display them. */
        if(!req.session ||
            !req.session.data ||
            !req.session.data.internalUserId) {
            return res.redirect('index')
        }

        let sessionData = req.session.data;       
        const { lastResult = {}, wrongPassword, isNewUser, device, internalUserId: userId, textId } = sessionData;
        let { enrollments } = sessionData;

        /** display error messages, if any */
        const messages = Object.assign({}, sessionData.messages);
        sessionData.messages = {};

        /** handle result from /auto */
        const action = lastResult.action === 'enroll' ? 'enroll' : 'verify';
        const didEnroll = lastResult.enrollment == 1;
        if (didEnroll) {
            const { count } = await functions.doCheckUser({
                userId, textId, type: 1, isMobile: device === 'mobile'
            });
            enrollments = count;
        }

        res.render('final', {
            title: 'Final - TypingDNA',
            sid:req.sessionID,
            action,
            showEnrollMessage: action === 'verify' && lastResult.enrollment == 1,
            wrongPassword,
            lastResult,
            messages,
            isNewUser,
            device,
            enrollments
        });
    },

     /** POST final page. */
     post: function(req, res) {
        if(!req.session ||
            !req.session.data||
            !req.session.data.internalUserId) {
            return res.redirect('index')
        }
        let { wrongPassword, internalUserId: userId, device } = req.session.data;

        if(wrongPassword) {
            /** User asked to reset the password */
            typingDnaClient.delete({ userId, device, type: 1 }, function(err) {
                if(err) {
                    return functions.displayError(req, res, {clearSession: true, message: 'Error resetting user data.'});
                }
                req.session.data = {
                    messages: { info: [{ msg: 'Your password was reset successfully' }] }
                };
                req.session.save(() => {
                    return res.redirect('index');
                })
            })
        }
    }
};

module.exports = final;
