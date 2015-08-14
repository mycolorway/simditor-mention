(function() {
  var spec;

  describe('simditor-mention', function() {
    var $editor_content, editor, item_opts;
    editor = null;
    $editor_content = null;
    item_opts = {
      items: [
        {
          id: 1,
          name: "春雨",
          pinyin: "chunyu",
          abbr: "cy",
          url: "http://www.example.com"
        }, {
          id: 2,
          name: "夏荷",
          pinyin: "xiahe",
          abbr: "xh"
        }, {
          id: 3,
          name: "秋叶",
          pinyin: "qiuye",
          abbr: "qy"
        }, {
          id: 4,
          name: "冬雪",
          pinyin: "dongxue",
          abbr: "dx"
        }
      ]
    };
    beforeEach(function() {
      $editor_content = $('<div id="editor" contenteditable="true"></div>').appendTo('body');
      return jasmine.clock().install();
    });
    afterEach(function() {
      jasmine.clock().uninstall();
      if (editor != null) {
        editor.destroy();
      }
      editor = null;
      $editor_content.remove();
      return $editor_content = null;
    });
    describe('render items', function() {
      return it('should render mention popover by setting items', function() {
        editor = spec.initEditor(item_opts);
        spec.simulationMention(editor, '@');
        return expect($('.simditor .simditor-mention-popover')).toBeVisible();
      });
    });
    describe('select item', function() {
      beforeEach(function() {
        editor = spec.initEditor(item_opts);
        return spec.simulationMention(editor, '@');
      });
      it('should set first item active by default', function() {
        return expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe(true);
      });
      it('should change active item by arrows', function() {
        spec.simulateKeyDown(editor, 'down');
        expect($(".simditor-mention-popover .item[data-pinyin='xiahe']").is('.selected')).toBe(true);
        spec.simulateKeyDown(editor, 'up');
        return expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe(true);
      });
      it('should select active item by enter', function() {
        var $mention;
        spec.simulateKeyDown(editor, 'enter');
        $mention = $(".simditor-body a.simditor-mention");
        expect($mention).toBeVisible();
        expect($mention.attr('href')).toBe('http://www.example.com');
        return expect($mention.data('mention')).toBe(true);
      });
      it('should select active item by tab', function() {
        var $mention;
        spec.simulateKeyDown(editor, 'down');
        spec.simulateKeyDown(editor, 'down');
        spec.simulateKeyDown(editor, 'tab');
        $mention = $(".simditor-body a.simditor-mention");
        expect($mention).toBeVisible();
        expect($mention.attr('href')).toBe('javascript:;');
        return expect($mention.data('mention')).toBe(true);
      });
      it('should select item by click', function() {
        var $mention;
        $(".simditor-mention-popover .item[data-pinyin='qiuye']").trigger('mousedown');
        $mention = $(".simditor-body a.simditor-mention");
        expect($mention).toBeVisible();
        return expect($mention.data('mention')).toBe(true);
      });
      it('should hide popover by space', function() {
        spec.simulateKeyDown(editor, 'space');
        return expect($('.simditor .simditor-mention-popover')).toBeHidden();
      });
      it('should refresh items by delete', function() {
        spec.simulationMention(editor, '@春');
        spec.simulateKeyDown(editor, 'delete');
        expect($('.simditor .simditor-mention-popover')).toBeVisible();
        return expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe(true);
      });
      it('should screening the results by pinyin', function() {
        $('.simditor-body span.simditor-mention').append('q');
        editor.mention.filterItem();
        expect($('.simditor .simditor-mention-popover')).toBeVisible();
        return expect($(".simditor-mention-popover .item[data-pinyin='qiuye']").is('.selected')).toBe(true);
      });
      return it('should screening the results by character', function() {
        $('.simditor-body span.simditor-mention').append('冬');
        editor.mention.filterItem();
        expect($('.simditor .simditor-mention-popover')).toBeVisible();
        return expect($(".simditor-mention-popover .item[data-pinyin='dongxue']").is('.selected')).toBe(true);
      });
    });
    return describe('render content', function() {
      beforeEach(function() {
        editor = spec.initEditor(item_opts);
        spec.simulationMention(editor, '@');
        return spec.simulateKeyDown(editor, 'enter');
      });
      return it('should render popover when click rendered content', function() {
        $('a.simditor-mention').trigger('mousedown');
        return expect($('.simditor .simditor-mention-popover')).toBeVisible();
      });
    });
  });

  spec = {
    KEY: {
      up: 38,
      down: 40,
      enter: 13,
      tab: 9,
      space: 32,
      'delete': 8
    },
    initEditor: function(opts) {
      return new Simditor({
        textarea: $('#editor'),
        placeholder: '这里输入文字...',
        pasteImage: true,
        toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent'],
        mention: opts
      });
    },
    simulationMention: function(editor, text) {
      var range;
      editor.setValue(text);
      editor.focus();
      range = document.createRange();
      range.setStart(editor.body.find('p')[0], 1);
      range.setEnd(editor.body.find('p')[0], 1);
      editor.selection.range(range);
      editor.body.trigger({
        type: 'keypress',
        which: '@'.charCodeAt(0)
      });
      return jasmine.clock().tick(51);
    },
    simulateKeyDown: function(editor, key) {
      return editor.body.trigger({
        type: 'keydown',
        which: this.KEY[key]
      });
    }
  };

}).call(this);
