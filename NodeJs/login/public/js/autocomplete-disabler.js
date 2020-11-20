/**
 * Recreates input fields that are not autocompleted or suggested by browsers.
 * The events and attributes of the target inputs are cloned.
 * Singleton implementation of the class.
 * Note: to be added after the TypingDNA recorder
 * @param {object} options - the settings of the class
 * @param {Boolean} options.showTypingVisualizer - add typing visualization to the inputs (default: false)
 * @param {Boolean} options.showTDNALogo - show the TypingDNA logo. Applies only if showTypingVisualizer = true (default: true)
 *
 * Instructions:
 * 1. add the class to the input on which autofill should be disabled.
 * 2. instantiate AutocompleteDisabler after the TypingDNA recorder.
 * 3. add the option if TypingVisualizer should be added to the input. If so, make sure it's not already added manually on that input.
 */
function AutocompleteDisabler(options) {
    if (/Trident|MSIE/.test(navigator.userAgent)) {
        return;
    }
    
    if (this.instantiated) {
        return this.instance;
    }

    if (!options) {
        options = {}
    }

    this.instantiated = true;
    this.instance = this;
    this.showTypingVisualizer = options.showTypingVisualizer || false;
    this.showTDNALogo = options.showTDNALogo !== undefined ? options.showTDNALogo : true;
    this.className = 'disable-autocomplete';
    this.typingVisualizer = undefined;
    this.autocompleteDisabled = false;
    this.copyPasteDisabled = false;
    this.elements = {};

    this.addTypingVisualizer();

    var self = this;
    this.onInput = function (e) {
        var target = self.elements[e.target.dataset.refelem];
        if (target === undefined) {
            return;
        }
        var reference = document.getElementById(target.refElementId);
        if (reference) {
            reference.value = e.target.value;
        }
    }
}

AutocompleteDisabler.prototype.getTargets = function () {
    var targets = [];
    if (this.autocompleteDisabled) {
        for (var prop in this.elements) {
            if (this.elements.hasOwnProperty(prop)) {
                targets.push(this.elements[prop].targetElementId);
            }
        }
    } else {
        var nodes = document.querySelectorAll('.' + this.className);
        for (var i = 0; i < nodes.length; ++i) {
            targets.push(nodes[i].id);
        }
    }
    return targets;
}

AutocompleteDisabler.prototype.disableAutocomplete = function () {
    this.removeTypingVisualizer();

    this.refElements = document.querySelectorAll('.' + this.className);
    for (var i = 0; i < this.refElements.length; i++) {
        var elem = this.refElements[i];
        if (!elem.id) {
            elem.id = this.getId(i + 1);
        }

        var newElem = this.getClonedElement(elem, this.getId(i));
        this.elements[elem.id] = {
            targetElement: newElem,
            targetElementId: newElem.id,
            refElementId: elem.id,
        }

        this.insertAfter(newElem, elem);
        elem.style.display = 'none';
    }
    this.autocompleteDisabled = true;

    this.addTypingVisualizer();
    if (this.copyPasteDisabled) {
        this.disableCopyPaste();
    }
    this.addListeners();
}

AutocompleteDisabler.prototype.getClonedElement = function (elem, id) {
    //clone existing elem
    var newElem = elem.cloneNode(true);
    newElem.id = elem.id + '-' + id;
    newElem.removeAttribute('name');

    // disable last pass autofill
    elem.setAttribute('data-lpignore', 'true');
    newElem.setAttribute('data-lpignore', 'true');

    //remove automplete-disabler class name from new element
    newElem.classList.remove(this.className);

    //change autocomplete attribute to new-
    if (newElem.autocomplete && !newElem.autocomplete.match('^new')) {
        newElem.setAttribute('autocomplete', 'new-' + newElem.autocomplete);
    }

    //link ref elem to new elem
    newElem.setAttribute('data-refelem', elem.id);
    return newElem;
}

AutocompleteDisabler.prototype.insertAfter = function (newNode, refNode) {
    if (!newNode || !refNode) {
        return;
    }
    if (refNode.parentNode) {
        refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    }
}

AutocompleteDisabler.prototype.addTypingVisualizer = function () {
    var self = this;
    if (self.showTypingVisualizer) {
        var initTypingVisualizer = function () {
            if (!self.typingVisualizer) {
                self.typingVisualizer = new TypingVisualizer({ showTDNALogo: self.showTDNALogo });
            }
            var targets = self.getTargets();
            for (var i = 0; i < targets.length; ++i) {
                self.typingVisualizer.addTarget(targets[i]);
            }
        }

        if (typeof TypingVisualizer === 'undefined') {
            console.log('The TypingDNA visualizer was not loaded');
            return;
        }

        initTypingVisualizer();
    }
}

AutocompleteDisabler.prototype.removeTypingVisualizer = function () {
    var targets = this.getTargets();
    if (this.typingVisualizer) {
        for (var i = 0; i < targets.length; ++i) {
            this.typingVisualizer.removeTarget(document.getElementById(targets[i]));
        }
    }
}

AutocompleteDisabler.prototype.disableCopyPaste = function () {
    var targetIds = this.getTargets();
    for (var i = 0; i < targetIds.length; i++) {
        var elem = document.getElementById(targetIds[i]);
        elem.setAttribute("oncopy", "return false");
        elem.setAttribute("onpaste", "return false");
        elem.setAttribute("oncut", "return false");
    }
}

AutocompleteDisabler.prototype.addTargetToTypingDNA = function (newNode, refNode) {
    if (!newNode || !refNode) {
        return
    }

    if (TypingDNA && TypingDNA.targetIds) {
        var targetLength = TypingDNA.targetIds.length;
        var targetFound = false;
        if (targetLength > 0) {
            for (var i = 0; i < targetLength; i++) {
                if (TypingDNA.targetIds[i] === refNode.id) {
                    targetFound = true;
                    break;
                }
            }
            if (targetFound) {
                TypingDNA.removeTarget(refNode.id);
                TypingDNA.addTarget(newNode.id);
            }
        }
    }
}

AutocompleteDisabler.prototype.getId = function (index) {
    return new Date().getTime() + index * Math.round(Math.random() * 100);
}

var eventNames = ['keydown', 'keypress', 'keyup', 'mousemove', 'mousedown', 'mouseup', 'scroll', 'click', 'dblclick', 'focus', 'copy', 'paste', 'input'];
AutocompleteDisabler.prototype.addListeners = function () {
    if (AutocompleteDisabler.isEmpty(this.elements)) {
        return;
    }

    for (var key in this.elements) {
        if (this.elements.hasOwnProperty(key)) {
            //add event listeners on new element
            for (var i = 0; i < eventNames.length; i++) {
                var eventName = eventNames[i];
                this.elements[key].targetElement.addEventListener(eventName, eventHandler);
            }
            //add event listener to copy text from the target to reference
            this.elements[key].targetElement.addEventListener('input', this.onInput);
        }
    }

    function eventHandler(e) {
        if (e.target.dataset.refelem) {
            var refElem = document.getElementById(e.target.dataset.refelem);
            if (refElem) {
                //duplicate event, because current event is already being dispatched
                var newEvent = new e.constructor(e.type, e);
                //dispatch the cloned event on the reference input
                refElem.dispatchEvent(newEvent);
                //avoid triggering the event twice
                e.stopPropagation();
            }
        }
    }
}

AutocompleteDisabler.isEmpty = function (obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
