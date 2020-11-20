/** GET final page. */
function final(req, res) {
    /** If there is no session data redirect to index */
    if (!req.session || !req.session.data || !req.session.data.internalUserId) {
        return res.redirect(303, 'index');
    }
    const sessionData = req.session.data;

    /** Check session variables for the last authentication result and display them. */
    const lastResult = sessionData.lastResult;
    let patternCount = sessionData.patternCount || 0;
    const device = sessionData.device || 'desktop';
    /** displays if autoenroll happened in the background */
    let showEnroll = lastResult.enrollment === 1;
    if (lastResult.enrollment === 1) {
        patternCount++;
    }

    res.render('final', {
        title: 'Final - TypingDNA',
        sid: req.sessionID,
        lastResult,
        patternCount,
        device,
        showEnroll,
    });
    req.session.data = {};
}

module.exports = final;
