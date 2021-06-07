/**
 * Recreates input fields that are not autocompleted or suggested by browsers.
 * The events and attributes of the target inputs are cloned.
 * Singleton implementation of the class.
 * Note: to be added after the TypingDNA recorder
 * @param {object} options - the settings of the class
 * @param {Boolean} options.showTypingVisualizer - add typing visualization to the inputs (default: false)
 * @param {Boolean} options.showTDNALogo - show the TypingDNA logo. Applies only if showTypingVisualizer = true. (default: true)
 * 
 * Instructions:
 * 1. add the class to the input on which autofill should be disabled. 
 * 2. instantiate AutocompleteDisabler after the TypingDNA recorder.
 * 3. add the option if TypingVisualizer should be added to the input. If so, make sure it's not already added manually on that input.
 */
function AutocompleteDisabler(options) {
    if(this.instantiated) {
        return this.instance;
    }
    if(!options) { options = {} }

    this.instantiated = true;
    this.instance = this;
    this.showTypingVisualizer = options.showTypingVisualizer || false;
    this.showTDNALogo = options.showTDNALogo != undefined ? options.showTDNALogo : true;
    this.className = 'disable-autocomplete';
    this.elements = {};
    var self = this;

    this.refElements = document.querySelectorAll('.' + this.className);
    for(var i=0; i < this.refElements.length; i++) {
        const elem = this.refElements[i];
        if(!elem.id) {
            elem.id = this.getId(i+1);
        }

        var newElem = getClonedElement(elem, this.getId(i));
        this.elements[elem.id] = {
            targetElement: newElem,
            targetElementId: newElem.id,
            refElementId: elem.id,
        }

        this.insertAfter(newElem, elem);
        elem.style.display = 'none';
    }

    this.addTypingVisualizer();

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

    this.addListeners();

    function getClonedElement(elem, id) {
        //clone existing elem
        var newElem = elem.cloneNode(true);
        newElem.id = elem.id + '-' + id;
        newElem.removeAttribute('name');

        //remove automplete-disabler class name from new element
        newElem.classList.remove(this.className);

        //change autocomplete attribute to new-
        if(newElem.autocomplete && !newElem.autocomplete.startsWith('new')) {
            newElem.setAttribute('autocomplete', 'new-' + newElem.autocomplete);
        }

        //link ref elem to new elem
        newElem.setAttribute('data-refelem', elem.id);
        return newElem;
    }
}

AutocompleteDisabler.prototype.insertAfter = function(newNode, refNode) {
    if(!newNode || !refNode) { return; }
    if(refNode.parentNode) {
        refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    }
}

AutocompleteDisabler.prototype.addTypingVisualizer = function() {
    var typingVisualizer;
    var self = this;
    if(self.showTypingVisualizer) {
        var initTypingVisualizer = function() {
            typingVisualizer = new TypingVisualizer({showTDNALogo: self.showTDNALogo});
            for(var key in self.elements) {
                typingVisualizer.addTarget(self.elements[key].refElementId);
            }
        }
        var s = document.createElement('script');
        s.src = '/js/typing-visualizer.js';
        s.defer = true;
        s.async = true;
        s.onreadystatechange = function () { // for IE
            if (this.readyState == 'complete') initTypingVisualizer;
          };
        s.onload = initTypingVisualizer;
        document.head.appendChild(s);
    }
}

AutocompleteDisabler.prototype.addTargetToTypingDNA = function(newNode, refNode) {
    if(!newNode || !refNode) { return }

    if(TypingDNA && TypingDNA.targetIds) {
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

AutocompleteDisabler.prototype.getId = function(index) {
    return new Date().getTime() + index * Math.round(Math.random()*100);
}

const eventNames = ['keydown', 'keypress', 'keyup','mousemove', 'mousedown','mouseup', 'scroll', 'click', 'dblclick', 'focus', 'copy', 'paste', 'input'];
AutocompleteDisabler.prototype.addListeners = function() {
    if(AutocompleteDisabler.isEmpty(this.elements)) {
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
        if(e.target.dataset.refelem) {
            var refElem = document.getElementById(e.target.dataset.refelem);
            if(refElem) { 
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

AutocompleteDisabler.isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

