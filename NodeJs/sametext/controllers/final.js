'use strict';

/** GET final page. */
function final(req, res) {
    /** If there is no session data redirect to index */
    if (!req.session || !req.session.data || !req.session.data.internalUserId) {
        return res.redirect(303, 'index');
    }
    let sessionData = req.session.data;
    /** Check session variables for the last authentication result and display them. */
    var loggedIn = (req.session && req.session.data.typingResult === 1);
    var lastResult = req.session.data.lastResult;
    var diagramCount = sessionData.diagramCount || 0;
    var device = sessionData.device || 'desktop';
    var resultColour = '#f8cd00';
    var showEnroll = false;
    if (lastResult && lastResult.score) {
        if (lastResult.score > 75) {
            showEnroll = true;
        }
        if (lastResult.score < 50) {
            resultColour = '#c70000'
        }
        else if (lastResult.score >= 70) {
            resultColour = '#45bb64'
        }
    }
    res.render('final', {
        title: 'Final - TypingDNA',
        sid: req.sessionID,
        loggedIn: loggedIn,
        lastResult: lastResult,
        diagramCount: diagramCount,
        device: device,
        resultColour: resultColour,
        showEnroll: showEnroll
    });
    req.session.data = {};
}

module.exports = final;
