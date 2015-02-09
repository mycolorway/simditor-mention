describe('Simditor-mention', function() {
  var $textarea, editor, initTypicalEditor, items;
  $textarea = null;
  editor = null;
  items = [
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
    }
  ];
  initTypicalEditor = function(option) {
    var e, range;
    if (option == null) {
      option = null;
    }
    option = $.extend({
      items: items
    }, option);
    editor = new Simditor({
      textarea: '#editor',
      mention: option
    });
    editor.setValue('@');
    editor.focus();
    range = document.createRange();
    range.setStart(editor.body.find('p')[0], 1);
    range.setEnd(editor.body.find('p')[0], 1);
    editor.selection.selectRange(range);
    editor.inputManager.focused = true;
    e = $.Event('keypress', {
      which: 64
    });
    editor.body.trigger(e);
    return jasmine.clock().tick(1);
  };
  beforeEach(function() {
    $textarea = $('<textarea id="editor"></textarea>').appendTo('body');
    return jasmine.clock().install();
  });
  afterEach(function() {
    jasmine.clock().uninstall();
    if (editor != null) {
      editor.destroy();
    }
    editor = null;
    $textarea.remove();
    return $textarea = null;
  });
  it('should render mention popover', function() {
    initTypicalEditor();
    return expect($('.simditor .simditor-mention-popover')).toBeVisible();
  });
  xit('should filter item based on abbr', function() {
    initTypicalEditor();
    editor.body.sendkeys('x');
    editor.mention.filterItem();
    return expect($('.simditor .simditor-mention-popover [data-abbr=xh]')).toHaveClass('selected');
  });
  it('should change active item by arrows', function() {
    var e;
    initTypicalEditor();
    e = $.Event('keydown', {
      which: 40
    });
    editor.mention._onKeyDown(e);
    expect($('.simditor .simditor-mention-popover [data-abbr=xh]')).toHaveClass('selected');
    e = $.Event('keydown', {
      which: 38
    });
    editor.mention._onKeyDown(e);
    return expect($('.simditor .simditor-mention-popover [data-abbr=cy]')).toHaveClass('selected');
  });
  describe('select item', function() {
    it('should render right content when no url', function() {
      var $link;
      initTypicalEditor();
      $('.simditor .simditor-mention-popover [data-abbr=xh]').click();
      $link = editor.body.find('a');
      expect($link).toHaveAttr('data-mention');
      expect($link).toHaveClass('simditor-mention');
      expect($link).toContainText('@夏荷');
      return expect($link).toHaveAttr('href', 'javascript:;');
    });
    it('should render right content when has url', function() {
      var $link;
      initTypicalEditor();
      $('.simditor .simditor-mention-popover [data-abbr=cy]').click();
      $link = editor.body.find('a');
      return expect($link).toHaveAttr('href', 'http://www.example.com');
    });
    return it('should render popover when click rendered content', function() {
      initTypicalEditor();
      $('.simditor .simditor-mention-popover [data-abbr=xh]').click();
      editor.body.find('a[data-mention]').mousedown();
      jasmine.clock().tick(1);
      return expect($('.simditor .simditor-mention-popover')).toBeVisible();
    });
  });
  it('should render special popover when itemRenderer on', function() {
    var option;
    option = {
      itemRenderer: function($itemEl, data) {
        var $span;
        $span = $('span', $itemEl);
        $('<img>').insertBefore($span);
        return $itemEl;
      }
    };
    initTypicalEditor(option);
    return expect($('.simditor .simditor-mention-popover .item img')).toExist();
  });
  return it('should render special link when linkRenderer on', function() {
    var $link, option;
    option = {
      linkRenderer: function($link) {
        return $link.addClass('special');
      }
    };
    initTypicalEditor(option);
    $('.simditor .simditor-mention-popover [data-abbr=cy]').click();
    $link = editor.body.find('a');
    console.log($link[0]);
    return expect($link).toHaveClass('special');
  });
});
