(function(window, doc) {
  'use strict';

  main();

  function main() {

    var div = doc.createElement('div');
    var dragDiv = 'draggable' in div;
    var evts = 'ondragstart' in div && 'ondrop' in div;

    var needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|android/i.test(navigator.userAgent);
    log((needsPatch ? '' : 'not ') + 'patching html5 drag drop');

    if (!needsPatch) {
      return;
    }

    doc.addEventListener('touchstart', touchstart);
  }

  function DragDrop(event, el, source) {

    this.touchPositions = {};
    this.dragData = {};
    this.el = el || event.target;
    this.source = source;
    this.isClick = true;

    event.preventDefault();

    log('dragstart');

    this.dispatchDragEvent('dragstart', this.source);
    this.elTranslation = readTransform(this.el);

    this.listen();

  }

  DragDrop.prototype = {
    listen: function() {
      var move = onEvt(doc, 'touchmove', this.move, this);
      var end = onEvt(doc, 'touchend', ontouchend, this);
      var cancel = onEvt(doc, 'touchcancel', cleanup, this);

      function ontouchend(event) {
        if (this.isClick) {
          this.click(event);
        } else {
          this.dragend(event);
        }
        cleanup.bind(this)();
      }

      function cleanup() {
        log('cleanup');
        this.touchPositions = {};
        this.dragData = null;
        document.body.removeChild(this.el);
        return [move, end, cancel].forEach(function(handler) {
          return handler.off();
        });
      }
    },
    move: function(event) {
      var deltas = {
        x: [],
        y: []
      };

      event.preventDefault();

      [].forEach.call(event.changedTouches, function(touch, index) {
        var lastPosition = this.touchPositions[index];
        if (lastPosition) {
          deltas.x.push(touch.pageX - lastPosition.x);
          deltas.y.push(touch.pageY - lastPosition.y);
        } else {
          this.touchPositions[index] = lastPosition = {};
        }
        lastPosition.x = touch.pageX;
        lastPosition.y = touch.pageY;
      }.bind(this));

      this.elTranslation.x += average(deltas.x);
      this.elTranslation.y += average(deltas.y);
      this.el.style["pointer-events"] = "none";
      this.el.style["opacity"] = "0.5";
      writeTransform(this.el, this.elTranslation.x, this.elTranslation.y);

      if (this.elTranslation.x >= 5 || this.elTranslation.x <= -5 ||
          this.elTranslation.y >= 5 || this.elTranslation.y <= -5) {
        this.isClick = false;
      }

      this.dispatchDragEvent('drag', this.source);

      var target = elementFromTouchEvent(this.el, event);

      if (target === null || target == this.source) {
        return;
      }

      if (target !== this.prevTarget) {
        if (this.prevTarget !== undefined) {
          this.dispatchDragEvent('dragleave', this.prevTarget);
        }
        this.dispatchDragEvent('dragenter', target);
        this.prevTarget = target;
      }
      this.dispatchDragEvent('dragover', target);
    },
    click: function(event) {
      log('click');

      var clickEvt = doc.createEvent('MouseEvents');
      clickEvt.initEvent('click', true, true);
      this.el.dispatchEvent(clickEvt);
    },
    dragend: function(event) {
      log('dragend');

      var target = elementFromTouchEvent(this.el, event);

      if (target && target != this.source) {
        log('found drop target ' + target.tagName);
        this.dispatchDrop(target);
      } else {
        log('no drop target, scheduling snapBack');
        
      }

      var dragendEvt = doc.createEvent('Event');
      dragendEvt.initEvent('dragend', true, true);
      this.el.dispatchEvent(dragendEvt);
      this.source.dispatchEvent(dragendEvt);
    },
    dispatchDrop: function(target) {
      var snapBack = true;

      var dropEvt = doc.createEvent('Event');
      dropEvt.initEvent('drop', true, true);
      dropEvt.dataTransfer = {
        getData: function(type) {
          return this.dragData[type];
        }.bind(this)
      };
      dropEvt.preventDefault = function() {
        
      }.bind(this);

      target.dispatchEvent(dropEvt);
    },
    dispatchDragEvent: function(eventname, el) {
      var evt = doc.createEvent('Event');
      evt.initEvent(eventname, true, true);
      evt.dataTransfer = {
        setData: function(type, val) {
          this.dragData[type] = val;
        }.bind(this),
        dropEffect: 'copy'
      };
      el.dispatchEvent(evt);
    }
  };

  function getPos(el){
    var rect = el.getBoundingClientRect();
    var elementLeft,elementTop; //x and y
    var scrollTop = document.documentElement.scrollTop?
                    document.documentElement.scrollTop:document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft?                   
                     document.documentElement.scrollLeft:document.body.scrollLeft;
    elementTop = rect.top+scrollTop;
    elementLeft = rect.left+scrollLeft;
    return {top: elementTop,left: elementLeft};
  }

  // event listeners
  function touchstart(evt) {
    var el = evt.target;
    do {
      if (el.getAttribute('draggable') === 'true') {
        evt.preventDefault();
        var ghost = el.cloneNode(true);
        var pos = getPos(el);
        ghost.style.top = pos.top + 'px';
        ghost.style.left = pos.left + 'px';
        ghost.style.position = 'absolute';
        document.body.appendChild(ghost);
        new DragDrop(evt, ghost, el);
      }
    } while ((el = el.parentNode) && el !== doc.body && el !== doc);
  }

  // DOM helpers
  function elementFromTouchEvent(el, event) {
    el.style.pointerEvents = 'none';

    var touch = event.changedTouches[0];
    var target = doc.elementFromPoint(
      touch.pageX - window.pageXOffset,
      touch.pageY - window.pageYOffset
    );

    el.style.pointerEvents = '';

    return target;
  }

  function readTransform(el) {
    var transform = el.style['-webkit-transform'];
    var x = 0;
    var y = 0;
    var match = /translate\(\s*(\d+)[^,]*,\D*(\d+)/.exec(transform);
    if (match) {
      x = parseInt(match[1], 10);
      y = parseInt(match[2], 10);
    }
    return {
      x: x,
      y: y
    };
  }

  function writeTransform(el, x, y) {
    var transform = el.style['-webkit-transform'].replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g, '');
    el.style['-webkit-transform'] = transform + ' translate(' + x + 'px,' + y + 'px) translateZ(1px)';
  }

  function clearTransform(el) {
    var transform = el.style['-webkit-transform'].replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g, '');
    el.style['-webkit-transform'] = transform;
  }

  function onEvt(el, event, handler, context) {
    if (context) {
      handler = handler.bind(context);
    }
    el.addEventListener(event, handler);
    return {
      off: function() {
        return el.removeEventListener(event, handler);
      }
    };
  }

  // general helpers
  function log(msg) {
    //console.log(msg);
  }

  function average(arr) {
    if (arr.length === 0) {
      return 0;
    }
    return arr.reduce((function(s, v) {
      return v + s;
    }), 0) / arr.length;
  }

})(window, document);