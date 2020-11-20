/**
 * Created by Stefan on 3/6/2018
 */

function TypingVisualizer(options) {
    if(!options) { options = {} }

    this.deltaX = 3;
    this.vpMaxHeight = 16;
    this.typingLength = 7;
    this.vpAlpha = 0.5;
    this.timeDown = new Date().getTime();
    this.timeUp = new Date().getTime();
    this.targets = {};
    this.showTDNALogo = options.showTDNALogo !== undefined ? options.showTDNALogo : true;
    this.logoHeight = 16;
    this.scrollOffset = 18;
    this.setStyle = function(element, style) {
        if(element === undefined) {
            return;
        }
        for(var o in style) {
            if(style.hasOwnProperty(o)) {
                element.style[o] = style[o];
            }
        }
    }
    var self = this;
    this.keyDown = function(e) {
        self.timeDown = new Date().getTime();
    }
    this.keyUp = function(e) {
        var target = self.targets[e.target.id]
        if(target === undefined) {
            return;
        }
        var lastTimeUp = self.timeUp;
        self.timeUp = new Date().getTime();
        var timeSeek = Math.min(500, self.timeUp - lastTimeUp);
        var timePress = Math.min(180, self.timeUp - self.timeDown);
        var cSeek = timeSeek / 500;
        var cPress = timePress / 180;
        if (e.keyCode == 8 || e.keyCode == 46) {
            target.deleteKeyData();
        } else if (e.keyCode != 13 && e.keyCode != 9) {
            var deltaY = 2 + Math.round(cSeek * (self.vpMaxHeight * 0.8));
            var difY = self.vpMaxHeight - deltaY;
            var offsetY = Math.round(cPress * self.vpMaxHeight);
            if (offsetY > difY) {
                offsetY = difY;
            }
            var posX = 2 + target.visualPattern.length * (self.deltaX + 1);
            var posY = 1 + self.vpMaxHeight - (deltaY + offsetY);
            var lastAlpha = self.vpAlpha;
            self.vpAlpha = cSeek;
            var alphaC = (Math.abs(self.vpAlpha - lastAlpha) * 4);
            alphaC = (alphaC > 1) ? 0.3 : 1.3 - alphaC;
            target.addKeyData([posX, posY, self.deltaX, deltaY, alphaC,]);
        }
    }
    this.onChange = function(e) {
        var target = self.targets[e.target.id]
        if(target === undefined) {
            return;
        }
        target.updatePosition();
    }
}

TypingVisualizer.prototype.removeTarget = function(target) {
    if(target === undefined) {
        return;
    }
    if(typeof target !== 'object') {
        target = [target,];
    }
    for(var i = 0; i < target.length; i++) {
        var targetElement;
        if(typeof target[i] === 'string') {
            targetElement = document.getElementById(target[i]);
        } else {
            targetElement = target[i];
        }
        if(targetElement && this.targets.hasOwnProperty(targetElement.id)) {
            this.targets[targetElement.id].removeEventListener('input', this.onChange);
            delete this.targets[targetElement.id];
        }
    }
};

TypingVisualizer.prototype.addTarget = function(target) {
    if(target === undefined) {
        return;
    }
    if(typeof target !== 'object') {
        target = [target,];
    }
    var self = this;

    for(var i = 0; i < target.length; i++) {
        var targetElement;
        if(typeof target[i] === 'string') {
            targetElement = document.getElementById(target[i]);
        } else {
            targetElement = target[i];
        }
        if(targetElement) {
            if(!this.targets.hasOwnProperty(targetElement.id)) {

                var canvas = this.generateCanvas(targetElement);
                var parent = targetElement.parentNode;

                var containerDiv = document.createElement("DIV");
                this.setStyle(containerDiv, {
                    position: 'relative',
                });

                if(canvas && parent && containerDiv.appendChild(canvas.container)) {
                    targetElement.addEventListener('input', self.onChange);
                    if(targetElement.style.width !== undefined) {
                        this.setStyle(containerDiv, {
                            position: 'relative',
                            width: targetElement.style.width,
                        });
                        targetElement.style.width = '100%';
                    }
                    var rightOffset =  targetElement.scrollHeight > targetElement.clientHeight ? this.scrollOffset : 0;
                    this.setStyle(canvas.container,{
                        position:'absolute',
                        width: (this.typingLength * (self.deltaX + 2)) +'px',
                        height: '100%',
                        right: (this.showTDNALogo ? this.logoHeight + 8 + rightOffset : rightOffset + 6) + 'px',
                        top: 0,
                        'z-index': 3
                    });

                    parent.insertBefore(containerDiv, targetElement)
                    containerDiv.appendChild(targetElement);
                    var clientRect = canvas.container.getBoundingClientRect();
                    canvas.canvas.width = clientRect.width || (this.typingLength * (self.deltaX + 2));
                    canvas.canvas.height = Math.min(clientRect.height || this.vpMaxHeight, this.vpMaxHeight);
                    this.setStyle(canvas.canvas, {
                        'margin-top': '6px',
                    });
                    this.setStyle(targetElement,{
                        'padding-right': (canvas.canvas.width + 6) + (this.showTDNALogo ? this.logoHeight + 4 : 0) +'px',
                    });
                    var logo;
                    if(this.showTDNALogo) {
                        logo = this.generateTDNALogo();
                        this.setStyle(logo,{
                            position: 'absolute',
                            right: (rightOffset + 6) + 'px',
                            top: '0',
                            'margin-top': '6px',
                            'line-height': this.logoHeight + 'px',
                            'z-index': 3
                        })
                        containerDiv.appendChild(logo);
                        if(typeof tippy !== 'undefined') {
                            tippy(logo);
                        }
                    }
                    this.targets[targetElement.id] = {
                        element: targetElement,
                        canvas: canvas.canvas,
                        canvasContainer: canvas.container,
                        canvasContext: canvas.canvas.getContext("2d"),
                        logo: logo,
                        visualPattern: [],
                        scrollOffset: 18,
                        hasScroll: targetElement.scrollHeight > targetElement.clientHeight,
                        hasVerticalScroll: function() {
                            return this.element.scrollHeight > this.element.clientHeight
                        },
                        clearCanvas: function() {
                            if(this.canvasContext) {
                                this.canvasContext.clearRect(0, 0, 120, 30)
                            }
                        },
                        addKeyData: function(data) {
                            this.visualPattern.push(data);
                            this.update();
                        },
                        deleteKeyData: function() {
                            this.visualPattern.pop();
                            this.update();
                        },
                        updatePosition: function() {
                            var hasScroll = this.hasVerticalScroll();
                            if(this.hasScroll !== hasScroll) {
                                this.hasScroll = hasScroll;
                                this.logo.style.right = parseInt(this.logo.style.right) +
                                    (hasScroll ? this.scrollOffset : -this.scrollOffset) + 'px';
                                this.canvasContainer.style.right = parseInt(this.canvasContainer.style.right) +
                                    (hasScroll ? this.scrollOffset : -this.scrollOffset) + 'px';
                            }
                        },
                        update: function() {
                            this.updatePosition();
                            var vpArr = this.visualPattern.slice(-self.typingLength);
                            while (vpArr.length < self.typingLength) {
                                vpArr.unshift([0, 0, 0, 0, 0,]);
                            }
                            this.clearCanvas();
                            for (var i = 0; i < vpArr.length; i++) {
                                this.canvasContext.fillStyle = "rgba(256, 110, 0, " + vpArr[i][4] + ")";
                                this.canvasContext.fillRect(i * (self.deltaX + 2), vpArr[i][1], vpArr[i][2], vpArr[i][3]);
                            }
                        },
                    };
                }
            }
        }
    }
    this.initListeners();
}

TypingVisualizer.prototype.generateTDNALogo = function() {
    var link = document.createElement("A");
    link.href = 'javascript: void(0)';
    link.setAttribute('tabindex',-1);
    link.setAttribute('data-toggle', 'popover');
    link.setAttribute('data-trigger', 'focus');
    link.setAttribute('data-content', 'Protected by TypingDNA');
    link.setAttribute('title', 'Protected by TypingDNA');
    link.setAttribute('data-placement','left');
    var img = document.createElement("IMG");
    this.setStyle(img,{
        height: this.logoHeight + 'px',
        width: this.logoHeight + 'px',
        'vertical-align': 'top',
    })
    img.src = 'https://www.typingdna.com/assets/images/external/icon-48.png';
    img.alt = 'Protected by TypingDNA';
    link.appendChild(img);
    return link;
}

TypingVisualizer.prototype.generateCanvas = function(target) {
    if(target === undefined) {
        return;
    }
    var container = document.createElement("DIV");
    var canvas = document.createElement("CANVAS");
    container.appendChild(canvas);
    return {
        canvas :canvas,
        container:container,
    };
};

TypingVisualizer.prototype.init = function() {
    for(var o in this.targets) {
        if(this.targets.hasOwnProperty(o)) {
            this.targets[o].visualPattern = [];
        }
    }
    this.initListeners();
};

TypingVisualizer.prototype.clearCanvas = function(id) {
    if(id === undefined) {
        if(this.targets.hasOwnProperty(id)) {
            this.targets[id].canvas.clearRect(0, 0, 120, 30)
        }
    } else {
        for(var target in this.targets) {
            if(this.targets.hasOwnProperty(target)) {
                if(this.targets[target].canvas) {
                    this.targets[target].canvas.clearRect(0, 0, 120, 30)
                }
            }
        }
    }
}

TypingVisualizer.prototype.initListeners = function() {
    document.removeEventListener('keyup', this.keyUp);
    document.removeEventListener('keydown', this.keyDown);

    if(TypingVisualizer.isEmpty(this.targets)) {
        return;
    }

    document.addEventListener("keyup", this.keyUp)
    document.addEventListener("keydown", this.keyDown)
}

TypingVisualizer.isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
