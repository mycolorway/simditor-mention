(function() {
  var Mention,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Mention = (function(_super) {
    __extends(Mention, _super);

    Mention.prototype.opts = {
      mention: false,
      mentionMembers: [],
      mentionSource: "",
      mentionUrlGenerator: null
    };

    Mention.prototype.members = null;

    Mention.prototype.active = false;

    function Mention() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Mention.__super__.constructor.apply(this, args);
      this.editor = this.widget;
    }

    Mention.prototype._init = function() {
      if (!this.opts.mention) {
        return;
      }
      if (this.opts.mentionMembers.length === 0 && this.opts.mentionSource.length === 0) {
        throw new Error("Must provide items or items source url");
      }
      if (this.opts.mentionMembers.length > 0) {
        this.members = this.opts.mentionMembers;
        this._renderPopover();
      } else {
        this.getMembers();
      }
      return this._bind();
    };

    Mention.prototype.getMembers = function() {
      return $.ajax({
        type: 'get',
        url: this.opts.mentionSource
      }).done((function(_this) {
        return function(result) {
          _this.members = result;
          return _this._renderPopover();
        };
      })(this));
    };

    Mention.prototype._bind = function() {
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
      this.editor.on('keydown', (function(_this) {
        return function(e) {
          if (e.which !== 229) {
            return;
          }
          return setTimeout(function() {
            var range;
            range = _this.editor.selection.getRange();
            if (!((range != null) && range.collapsed)) {
              return;
            }
            range = range.cloneRange();
            range.setStart(range.startContainer, Math.max(range.startOffset - 1, 0));
            if (range.toString() === '@') {
              return _this.editor.trigger($.Event('keypress'), {
                which: 64
              });
            }
          }, 0);
        };
      })(this));
      this.editor.on('keypress', (function(_this) {
        return function(e) {
          var $closestBlock;
          if (e.which !== 64) {
            return;
          }
          $closestBlock = _this.editor.util.closestBlockEl();
          if ($closestBlock.is('pre')) {
            return;
          }
          return setTimeout(function() {
            var range;
            range = _this.editor.selection.getRange();
            if (range == null) {
              return;
            }
            range = range.cloneRange();
            range.setStart(range.startContainer, Math.max(range.startOffset - 2, 0));
            if (/^[A-Za-z0-9]@/.test(range.toString())) {
              return;
            }
            return _this.show();
          });
        };
      })(this));
      this.editor.on('keydown.simditor-mention', $.proxy(this._onKeyDown, this)).on('keyup.simditor-mention', $.proxy(this._onKeyUp, this));
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
          _this.editor.selection.selectRange(range);
          return false;
        };
      })(this));
      return this.editor.wrapper.on('mousedown.simditor-mention', (function(_this) {
        return function(e) {
          if ($(e.target).closest('.simditor-mention-popover', _this.editor.wrapper).length) {
            return;
          }
          return _this.hide();
        };
      })(this));
    };

    Mention.prototype.show = function($target) {
      var range;
      this.active = true;
      if ($target) {
        this.target = $target;
      } else {
        this.target = $('<span class="simditor-mention" />');
        range = this.editor.selection.getRange();
        range.setStart(range.startContainer, range.endOffset - 1);
        range.surroundContents(this.target[0]);
      }
      this.editor.selection.setRangeAtEndOf(this.target, range);
      this.popoverEl.find('.member:first').addClass('selected').siblings('.member').removeClass('selected');
      this.popoverEl.show();
      this.popoverEl.find('.member').show();
      return this.refresh();
    };

    Mention.prototype.refresh = function() {
      var targetOffset, wrapperOffset;
      wrapperOffset = this.editor.wrapper.offset();
      targetOffset = this.target.offset();
      return this.popoverEl.css({
        top: targetOffset.top - wrapperOffset.top + this.target.height() + 2,
        left: targetOffset.left - wrapperOffset.left + this.target.width()
      });
    };

    Mention.prototype._renderPopover = function() {
      var $memberEl, $membersEl, member, _i, _len, _ref, _ref1, _ref2;
      this.popoverEl = $('<div class=\'simditor-mention-popover\'>\n  <div class=\'members\'></div>\n</div>').appendTo(this.editor.el);
      $membersEl = this.popoverEl.find('.members');
      _ref = this.members;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        member = _ref[_i];
        $memberEl = $("<a class=\"member\" href=\"javascript:;\"\n  data-id=\"" + member.id + "\"\n  data-name=\"" + member.name + "\"\n  data-pinyin=\"" + ((_ref1 = member.pinyin) != null ? _ref1 : "") + "\"\n  data-abbr=\"" + ((_ref2 = member.abbr) != null ? _ref2 : "") + "\" >\n  <span>" + member.name + "</span>\n</a>").appendTo($membersEl);
      }
      this.popoverEl.on('mouseenter', '.member', function(e) {
        return $(this).addClass('selected').siblings('.member').removeClass('selected');
      });
      this.popoverEl.on('mousedown', '.member', (function(_this) {
        return function(e) {
          _this.selectMember();
          return false;
        };
      })(this));
      return $membersEl.on('mousewheel', function(e, delta) {
        $(this).scrollTop($(this).scrollTop() - 10 * delta);
        return false;
      });
    };

    Mention.prototype.decorate = function($link) {
      return $link.addClass('simditor-mention');
    };

    Mention.prototype.undecorate = function($link) {
      return $link.removeClass('simditor-mention');
    };

    Mention.prototype.hide = function() {
      if (this.target) {
        this.target.contents().first().unwrap();
        this.target = null;
      }
      this.popoverEl.hide().find('.member').removeClass('selected');
      this.active = false;
      return null;
    };

    Mention.prototype.selectMember = function() {
      var $memberLink, range, selectedMember, spaceNode, url;
      selectedMember = this.popoverEl.find('.member.selected');
      if (!(selectedMember.length > 0)) {
        return;
      }
      if (this.opts.mentionUrlGenerator) {
        url = this.opts.mentionUrlGenerator(selectedMember.attr('data-id'));
      } else {
        url = "javascript:;";
      }
      $memberLink = $('<a/>', {
        'class': 'simditor-mention',
        'data-id': selectedMember.attr('data-id'),
        text: '@' + selectedMember.attr('data-name'),
        href: url,
        'data-mention': true
      });
      this.target.replaceWith($memberLink);
      if (this.target.hasClass('edit')) {
        this.editor.selection.setRangeAfter($memberLink);
      } else {
        spaceNode = document.createTextNode('\u00A0');
        $memberLink.after(spaceNode);
        range = document.createRange();
        this.editor.selection.setRangeAtEndOf(spaceNode, range);
      }
      return this.hide();
    };

    Mention.prototype.filterMember = function() {
      var $memberEls, e, re, results, val;
      val = this.target.text().toLowerCase().substr(1).replace(/'/g, '');
      try {
        re = new RegExp(val, 'i');
      } catch (_error) {
        e = _error;
        re = new RegExp('', 'i');
      }
      $memberEls = this.popoverEl.find('.member');
      results = $memberEls.hide().removeClass('selected').filter(function(i) {
        var $el, str;
        $el = $(this);
        str = [$el.data('name'), $el.data('pinyin'), $el.data('abbr')].join(" ");
        return re.test(str);
      });
      if (results.length) {
        this.popoverEl.show();
        return results.show().first().addClass('selected');
      } else {
        return this.popoverEl.hide();
      }
    };

    Mention.prototype._onKeyDown = function(e) {
      var memberEl, memberH, node, parentEl, parentH, position, selectedMember;
      if (!this.active) {
        return;
      }
      if (e.which === 37 || e.which === 39 || e.which === 27) {
        this.editor.selection.save();
        this.hide();
        this.editor.selection.restore();
        return false;
      } else if (e.which === 38 || e.which === 40) {
        selectedMember = this.popoverEl.find('.member.selected');
        if (selectedMember.length < 1) {
          this.popoverEl.find('.member:first'.addClass('selected'));
          return false;
        }
        memberEl = selectedMember[e.which === 38 ? 'prev' : 'next']('.member:visible');
        if (memberEl.length > 0) {
          selectedMember.removeClass('selected');
          memberEl.addClass('selected');
          parentEl = memberEl.parent();
          position = memberEl.position();
          parentH = parentEl.height();
          memberH = memberEl.outerHeight();
          if (position.top < 0) {
            parentEl.scrollTop(memberH * memberEl.prevAll('.member').length);
          } else if (position.top > parentH - memberH) {
            parentEl.scrollTop(memberH * memberEl.prevAll('.member').length - parentH + memberH);
          }
        }
        return false;
      } else if (e.which === 13 || e.which === 9) {
        selectedMember = this.popoverEl.find('.member.selected');
        if (selectedMember.length > 0) {
          this.selectMember();
          return false;
        } else {
          node = document.createTextNode(this.target.text());
          this.target.before(node).remove();
          this.hide();
          return this.editor.selection.setRangeAtEndOf(node);
        }
      } else if (e.which === 8 && this.target.text() === '@') {
        node = document.createTextNode('@');
        this.target.replaceWith(node);
        this.hide();
        return this.editor.selection.setRangeAtEndOf(node);
      } else if (e.which === 32) {
        node = document.createTextNode(this.target.text() + '\u00A0');
        this.target.before(node).remove();
        this.hide();
        this.editor.selection.setRangeAtEndOf(node);
        return false;
      }
    };

    Mention.prototype._onKeyUp = function(e) {
      if (!this.active || $.inArray(e.which, [9, 16, 50, 27, 37, 38, 39, 40, 32]) > -1) {
        return;
      }
      this.filterMember();
      return this.refresh();
    };

    return Mention;

  })(Plugin);

  Simditor.connect(Mention);

}).call(this);
