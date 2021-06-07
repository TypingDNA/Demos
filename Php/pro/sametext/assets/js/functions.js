/**************************************
 * GENERIC FUNCTIONS USED BY THE DEMO *
 **************************************/

/** gets the pressed keys count */
function getStackLen() {
    if( !TypingDNA ||
        !TypingDNA.history ||
        !TypingDNA.history.stack) {
        return null;
    }
    return TypingDNA.history.stack.length
}

/**
 * verifies if the typed text is similar to the text to be typed,
 * this is a simple/fast implementation that works fine, but only looks at words
 */
function fastCompareTexts(t1, t2) {
    var dt1 = t1.split(' ');
    var dt2 = t2.split(' ');
    var total2 = 0;
    var total1 = 0;
    for (var i in dt2) {
        total2 += (dt1.indexOf(dt2[i]) > -1) ? 1 : 0;
    }
    for (var i in dt1) {
        total1 += (dt2.indexOf(dt1[i]) > -1) ? 1 : 0;
    }
    var total = (total1 < total2) ? total1 : total2;
    var length = (dt1.length > dt2.length) ? dt1.length : dt2.length;
    /** returns a number between 0 (completely different texts) and 1 (identical texts) */
    return total / length;
}
