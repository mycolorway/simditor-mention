(function() {
  describe('simditor-mention', function() {
    var $editor_content, editor;
    editor = null;
    $editor_content = null;
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
        editor = window.spec.initEditor(window.spec.item_opts);
        window.spec.simulationMention(editor, '@');
        return expect($('.simditor .simditor-mention-popover')).toBeVisible();
      });
    });
    describe('select item', function() {
      beforeEach(function() {
        editor = window.spec.initEditor(window.spec.item_opts);
        return window.spec.simulationMention(editor, '@');
      });
      it('should set first item active by default', function() {
        return expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe(true);
      });
      it('should change active item by arrows', function() {
        window.spec.simulateKeyDown(editor, 'down');
        expect($(".simditor-mention-popover .item[data-pinyin='xiahe']").is('.selected')).toBe(true);
        window.spec.simulateKeyDown(editor, 'up');
        return expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe(true);
      });
      it('should select active item by enter', function() {
        var $mention;
        window.spec.simulateKeyDown(editor, 'enter');
        $mention = $(".simditor-body a.simditor-mention");
        expect($mention).toBeVisible();
        expect($mention.attr('href')).toBe('http://www.example.com');
        return expect($mention.data('mention')).toBe(true);
      });
      it('should select active item by tab', function() {
        var $mention;
        window.spec.simulateKeyDown(editor, 'down');
        window.spec.simulateKeyDown(editor, 'down');
        window.spec.simulateKeyDown(editor, 'tab');
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
        window.spec.simulateKeyDown(editor, 'space');
        return expect($('.simditor .simditor-mention-popover')).toBeHidden();
      });
      it('should refresh items by delete', function() {
        window.spec.simulationMention(editor, '@春');
        window.spec.simulateKeyDown(editor, 'delete');
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
        editor = window.spec.initEditor(window.spec.item_opts);
        window.spec.simulationMention(editor, '@');
        return window.spec.simulateKeyDown(editor, 'enter');
      });
      return it('should render popover when click rendered content', function() {
        $('a.simditor-mention').trigger('mousedown');
        return expect($('.simditor .simditor-mention-popover')).toBeVisible();
      });
    });
  });

}).call(this);
