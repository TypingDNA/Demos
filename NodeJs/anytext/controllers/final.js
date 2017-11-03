'use strict';

/** GET final page. */
function final(req, res) {
    /** Check session variables for the last authentication result and display them. */
    var loggedIn = (req.session && req.session.data.typingResult === 1);
    var lastResult = req.session.data.lastResult;
    res.render('final', {
        title: 'Final - TypingDNA',
        sid:req.sessionID,
        loggedIn: loggedIn,
        lastResult: lastResult
    });
    req.session.data = {};
}

module.exports = final;
