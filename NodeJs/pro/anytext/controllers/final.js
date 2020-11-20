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
    let confidence = "Low";
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
        sid: req.sessionID,
        messages,
        loggedIn,
        lastResult,
        patternCount: patternCount || 0,
        device: device || 'desktop',
        resultColour,
        showEnroll,
        confidence,
    });
    req.session.data = {};
}

module.exports = final;
