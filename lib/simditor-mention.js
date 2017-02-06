(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('simditor-mention', ["jquery","simditor","simple-module"], function (a0,b1,c2) {
      return (root['SimditorMention'] = factory(a0,b1,c2));
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"),require("simditor"),require("simple-module"));
  } else {
    root['SimditorMention'] = factory(root["jQuery"],root["Simditor"],root["SimpleModule"]);
  }
}(this, function ($, Simditor, SimpleModule) {

var SimditorMention, debounce,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

debounce = function(func, wait, immediate) {
  var timeout;
  timeout = void 0;
  return function() {
    var args, callNow, context, later;
    context = this;
    args = arguments;
    later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};

SimditorMention = (function(superClass) {
  extend(SimditorMention, superClass);

  function SimditorMention() {
    return SimditorMention.__super__.constructor.apply(this, arguments);
  }

  SimditorMention.pluginName = 'Mention';

  SimditorMention.prototype.opts = {
    mention: false
  };

  SimditorMention.prototype.active = false;

  SimditorMention.prototype._init = function() {
    if (!this.opts.mention) {
      return;
    }
    this.editor = this._module;
    this.opts.mention = $.extend({
      items: [],
      url: '',
      nameKey: "name",
      pinyinKey: "pinyin",
      abbrKey: "abbr",
      itemRenderer: null,
      linkRenderer: null
    }, this.opts.mention);
    if (!$.isArray(this.opts.mention.items) && this.opts.mention.url === "") {
      throw new Error("Must provide items or source url");
    }
    this.items = [];
    if (this.editor.formatter._allowedAttributes['a']) {
      this.editor.formatter._allowedAttributes['a'].push('data-mention');
    } else {
      this.editor.formatter._allowedAttributes['a'] = ['data-mention'];
    }
    if (this.opts.mention.items.length > 0) {
      this.items = this.opts.mention.items;
      this._renderPopover();
    } else if (!this._isXHREnabled()) {
      this.getItems();
    }
    return this._bind();
  };

  SimditorMention.prototype._isXHREnabled = function() {
    return this.opts.mention.xhrUrl && this.opts.mention.xhrHeaders && this.opts.mention.xhrData;
  };

  SimditorMention.prototype.getItems = function(query) {
    var options;
    options = {
      type: 'get',
      url: this.opts.mention.url
    };
    if (this._isXHREnabled()) {
      options.url = this.opts.mention.xhrUrl;
      options.headers = this.opts.mention.xhrHeaders;
      options.data = this.opts.mention.xhrData;
      options.data.q = query;
    }
    return $.ajax(options).done((function(_this) {
      return function(result) {
        var formatter, node, text;
        formatter = _this.opts.mention.xhrResponseFormat;
        _this.items = formatter != null ? formatter(result) : result;
        if (_this.items.length > 0) {
          return _this._renderPopover();
        } else {
          _this.target = _this.editor.body.find('span.simditor-mention');
          text = _this.target.text();
          node = document.createTextNode(text);
          _this.target.before(node).remove();
          _this.hide();
          return _this.editor.selection.setRangeAtEndOf(node);
        }
      };
    })(this));
  };

  SimditorMention.prototype.updateSelectedItem = function(item) {
    return item.addClass('selected').siblings('.item').removeClass('selected');
  };

  SimditorMention.prototype._bind = function() {
    var onKeyUpEvent;
    this.editor.on('decorate', (function(_this) {
      return function(e, $el) {
        return $el.find('a[data-mention]').each(function(i, link) {
          return _this.decorate($(link));
        });
      };
    })(this));
    this.editor.on('undecorate', (function(_this) {
      return function(e, $el) {
        $el.find('a[data-mention]').each(function(i, link) {
          return _this.undecorate($(link));
        });
        return $el.find('simditor-mention').children().unwrap();
      };
    })(this));
    this.editor.on('pushundostate', (function(_this) {
      return function(e) {
        if (_this.editor.body.find('span.simditor-mention').length > 0) {
          return false;
        }
        return e.result;
      };
    })(this));
    this.editor.body.bind('mousedown touchend', (function(_this) {
      return function() {
        return _this.editor.focus();
      };
    })(this));
    this.editor.on('keydown', (function(_this) {
      return function(e) {
        if (e.which !== 229) {
          return;
        }
        return setTimeout(function() {
          var range;
          range = _this.editor.selection.range();
          if (!((range != null) && range.collapsed)) {
            return;
          }
          range = range.cloneRange();
          range.setStart(range.startContainer, Math.max(range.startOffset - 1, 0));
          if (range.toString() === '@' && !_this.active) {
            return _this.editor.trigger($.Event('keypress', {
              which: 64
            }));
          }
        }, 50);
      };
    })(this));
    this.editor.on('keypress', (function(_this) {
      return function(e) {
        var $closestBlock;
        if (e.which !== 64) {
          return;
        }
        $closestBlock = _this.editor.selection.blockNodes().last();
        if ($closestBlock.is('pre')) {
          return;
        }
        return setTimeout(function() {
          var range;
          range = _this.editor.selection.range();
          if (range == null) {
            return;
          }
          range = range.cloneRange();
          range.setStart(range.startContainer, Math.max(range.startOffset - 2, 0));
          if (/^[A-Za-z0-9]@/.test(range.toString())) {
            return;
          }
          return _this.show();
        }, 50);
      };
    })(this));
    onKeyUpEvent = debounce($.proxy(this._onKeyUp, this), 400);
    this.editor.on('keydown.simditor-mention', $.proxy(this._onKeyDown, this)).on('keyup.simditor-mention', onKeyUpEvent);
    this.editor.on('blur', (function(_this) {
      return function() {
        if (_this.active) {
          return _this.hide();
        }
      };
    })(this));
    this.editor.body.on('mousedown', 'a.simditor-mention', (function(_this) {
      return function(e) {
        var $link, $target, $textNode, range;
        $link = $(e.currentTarget);
        $target = $('<span class="simditor-mention edit" />').append($link.contents());
        $link.replaceWith($target);
        _this.show($target);
        $textNode = $target.contents().eq(0);
        range = document.createRange();
        range.selectNodeContents($textNode[0]);
        range.setStart(range.startContainer, 1);
        _this.editor.selection.range(range);
        return false;
      };
    })(this));
    return this.editor.wrapper.on('mousedown.simditor-mention', (function(_this) {
      return function(e) {
        if ($(e.target).closest('.simditor-mention-popover', _this.editor.wrapper).length) {
          return;
        }
        if (_this.popoverEl != null) {
          return _this.hide();
        }
      };
    })(this));
  };

  SimditorMention.prototype.show = function($target) {
    var range;
    this.active = true;
    if ($target) {
      this.target = $target;
    } else {
      this.target = $('<span class="simditor-mention" />');
      range = this.editor.selection.range();
      range.setStart(range.startContainer, range.endOffset - 1);
      range.surroundContents(this.target[0]);
    }
    this.editor.selection.setRangeAtEndOf(this.target, range);
    if ((this.popoverEl == null) || this.popoverEl.find('.item').length === 0) {
      return;
    }
    this.popoverEl.find('.item:first').addClass('selected').siblings('.item').removeClass('selected');
    this.popoverEl.show();
    this.popoverEl.find('.items').scrollTop(0);
    this.popoverEl.find('.item').show();
    return this.refresh();
  };

  SimditorMention.prototype.refresh = function() {
    var popoverH, targetOffset, top, wrapperOffset;
    wrapperOffset = this.editor.wrapper.offset();
    targetOffset = this.target.offset();
    popoverH = this.popoverEl.height();
    top = targetOffset.top - wrapperOffset.top + this.target.height() + 2;
    return this.popoverEl.css({
      top: top,
      left: targetOffset.left - wrapperOffset.left + this.target.width()
    });
  };

  SimditorMention.prototype._renderPopover = function() {
    var $itemEl, $itemsEl, abbr, item, j, len, name, pinyin, ref;
    if (this.popoverEl == null) {
      this.popoverEl = $('<div class=\'simditor-mention-popover\'>\n  <div class=\'items\'></div>\n</div>').appendTo(this.editor.el);
    }
    $itemsEl = this.popoverEl.find('.items');
    if (this.items.length > 0) {
      $itemsEl.empty();
    }
    ref = this.items;
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      name = item[this.opts.mention.nameKey];
      pinyin = item[this.opts.mention.pinyinKey];
      abbr = item[this.opts.mention.abbrKey];
      $itemEl = $("<a class=\"item\" href=\"javascript:;\"\n  data-pinyin=\"" + pinyin + "\"\n  data-abbr=\"" + abbr + "\">\n  <span></span>\n</a>");
      $itemEl.attr("data-name", name).find("span").text(name);
      if (this.opts.mention.itemRenderer) {
        $itemEl = this.opts.mention.itemRenderer($itemEl, item);
      }
      $itemEl.appendTo($itemsEl).data('item', item);
    }
    this.popoverEl.on('mouseenter', '.item', (function(_this) {
      return function(e) {
        return _this.updateSelectedItem($(e.currentTarget));
      };
    })(this));
    this.popoverEl.on('mousedown', '.item', (function(_this) {
      return function(e) {
        _this.selectItem();
        return false;
      };
    })(this));
    this.popoverEl.on('touchstart', '.item', (function(_this) {
      return function(e) {
        var touches;
        if (!_this.popoverIsTouching) {
          _this.updateSelectedItem($(e.currentTarget));
          touches = e.originalEvent.targetTouches[0];
          _this.popoverStartY = touches.clientY;
          _this.popoverIsTouching = true;
          _this.popoverCancelTouch = false;
        }
        return void 0;
      };
    })(this));
    this.popoverEl.on('touchmove', '.item', (function(_this) {
      return function(e) {
        var currentY, touches;
        if (_this.popoverIsTouching) {
          touches = e.originalEvent.targetTouches[0];
          currentY = touches.clientY;
          _this.popoverCancelTouch = _this.popoverCancelTouch || (Math.abs(_this.popoverStartY - currentY) > 10);
        }
        return void 0;
      };
    })(this));
    return this.popoverEl.on('touchend', '.item', (function(_this) {
      return function(e) {
        _this.popoverIsTouching = false;
        if (!_this.popoverCancelTouch) {
          _this.selectItem();
        }
        return void 0;
      };
    })(this));
  };

  SimditorMention.prototype.decorate = function($link) {
    return $link.addClass('simditor-mention');
  };

  SimditorMention.prototype.undecorate = function($link) {
    return $link.removeClass('simditor-mention');
  };

  SimditorMention.prototype.hide = function() {
    if (this.target) {
      this.target.contents().first().unwrap();
      this.target = null;
    }
    if (this.popoverEl) {
      this.popoverEl.hide().find('.item').removeClass('selected');
      this.popoverEl.find('.items').empty();
    }
    this.active = false;
    return null;
  };

  SimditorMention.prototype.selectItem = function() {
    var $itemLink, $selectedItem, data, href, range, spaceNode;
    $selectedItem = this.popoverEl.find('.item.selected');
    if (!($selectedItem.length > 0)) {
      return;
    }
    data = $selectedItem.data('item');
    href = data.url || "javascript:;";
    $itemLink = $('<a/>', {
      'class': 'simditor-mention',
      text: '@' + $selectedItem.attr('data-name'),
      href: href,
      'data-mention': true
    });
    if (this.opts.mention.linkRenderer) {
      $itemLink = this.opts.mention.linkRenderer($itemLink, data);
    }
    this.target.replaceWith($itemLink);
    this.editor.trigger("mention", [$itemLink, data]);
    if (this.target.hasClass('edit')) {
      this.editor.selection.setRangeAfter($itemLink);
    } else {
      spaceNode = document.createTextNode('\u00A0');
      $itemLink.after(spaceNode);
      range = document.createRange();
      this.editor.selection.setRangeAtEndOf(spaceNode, range);
    }
    return this.hide();
  };

  SimditorMention.prototype.filterItem = function() {
    var $itemEls, e, re, results, val;
    val = this.target.text().toLowerCase().substr(1).replace(/'/g, '');
    val = val.replace(String.fromCharCode(12288), '');
    val = val.replace(String.fromCharCode(160), '');
    if (this.popoverEl != null) {
      $itemEls = this.popoverEl.find('.item');
    }
    if (this._isXHREnabled() && val.length) {
      if (this.popoverEl != null) {
        this.popoverEl.hide();
      }
      return this.getItems(val).then((function(_this) {
        return function() {
          $itemEls = _this.popoverEl.find('.item');
          return _this._afterFilter($itemEls);
        };
      })(this));
    }
    try {
      re = new RegExp("(|\\s)" + val, 'i');
    } catch (_error) {
      e = _error;
      re = new RegExp('', 'i');
    }
    if ($itemEls) {
      results = $itemEls.hide().removeClass('selected').filter(function(i) {
        var $el, str;
        $el = $(this);
        str = [$el.data('name'), $el.data('pinyin'), $el.data('abbr')].join(" ");
        return re.test(str);
      });
    }
    return this._afterFilter(results);
  };

  SimditorMention.prototype._afterFilter = function(results) {
    if (results.length) {
      this.popoverEl.show();
      this.popoverEl.find('.items').scrollTop(0);
      this.active = true;
      results.show().first().addClass('selected');
      return this.refresh();
    } else {
      this.popoverEl.hide();
      return this.active = false;
    }
  };

  SimditorMention.prototype._changeFocus = function(type) {
    var itemEl, itemH, parentEl, parentH, position, selectedItem;
    selectedItem = this.popoverEl.find('.item.selected');
    if (selectedItem.length < 1) {
      this.popoverEl.find('.item:first').addClass('selected');
      return false;
    }
    itemEl = selectedItem[type + 'All']('.item:visible').first();
    if (itemEl.length < 1) {
      return false;
    }
    selectedItem.removeClass('selected');
    itemEl.addClass('selected');
    parentEl = itemEl.parent();
    parentH = parentEl.height();
    position = itemEl.position();
    itemH = itemEl.outerHeight();
    if (position.top > parentH - itemH) {
      parentEl.scrollTop(itemH * itemEl.prevAll('.item:visible').length - parentH + itemH);
    }
    if (position.top < 0) {
      return parentEl.scrollTop(itemH * itemEl.prevAll('.item:visible').length);
    }
  };

  SimditorMention.prototype._onKeyDown = function(e) {
    var node, selectedItem;
    if (!this.active) {
      return;
    }
    if (e.which === 37 || e.which === 39 || e.which === 27) {
      this.editor.selection.save();
      this.hide();
      this.editor.selection.restore();
      return false;
    } else if (e.which === 38 || (e.which === 80 && e.ctrlKey)) {
      this._changeFocus('prev');
      return false;
    } else if (e.which === 40 || (e.which === 78 && e.ctrlKey)) {
      this._changeFocus('next');
      return false;
    } else if (e.which === 13 || e.which === 9) {
      selectedItem = this.popoverEl.find('.item.selected');
      if (selectedItem.length) {
        this.selectItem();
        return false;
      } else {
        node = document.createTextNode(this.target.text());
        this.target.before(node).remove();
        this.hide();
        return this.editor.selection.setRangeAtEndOf(node);
      }
    } else if (e.which === 8 && (this.target.text() === '@' || this.target.text() === '')) {
      node = document.createTextNode('@');
      this.target.replaceWith(node);
      this.hide();
      return this.editor.selection.setRangeAtEndOf(node);
    }
  };

  SimditorMention.prototype._onKeyUp = function(e) {
    if (!this.active || $.inArray(e.which, [9, 16, 17, 27, 37, 38, 39, 40]) > -1 || (e.shiftKey && e.which === 50) || (e.ctrlKey && (e.which === 78 || e.which === 80))) {
      return;
    }
    return this.filterItem();
  };

  return SimditorMention;

})(SimpleModule);

Simditor.connect(SimditorMention);

return SimditorMention;

}));
