'use strict';

/** GET final page. */
function final(req, res) {
    /** If there is no session data redirect to index */
    if (!req.session || !req.session.data || !req.session.data.internalUserId) {
        return res.redirect(303, 'index');
    }
    const sessionData = req.session.data;
    const messages = Object.assign({}, sessionData.messages);
    sessionData.messages = null;
    /** Check session variables for the last authentication result and display them. */
    const loggedIn = sessionData.typingResult === 1;
    const { lastResult, device } = sessionData;
    let { patternCount } = sessionData;
    /** displays if autoenroll happened in the background */
    let showEnroll = false;

    if (lastResult && lastResult.action === 'verify;enroll') {
        showEnroll = true;
        patternCount += 1;
    }

    /** transform confidence number in descriptive confidence */
    let confidence = "Low";
    if (lastResult !== undefined && lastResult.highConfidence === 1) {
        confidence = 'High';
    }

    res.render('final', {
        title: 'Final - TypingDNA',
        sid: req.sessionID,
        messages,
        loggedIn,
        lastResult,
        patternCount: patternCount || 0,
        device: device || 'desktop',
        showEnroll,
        confidence,
    });
    req.session.data = {};
}

module.exports = final;
