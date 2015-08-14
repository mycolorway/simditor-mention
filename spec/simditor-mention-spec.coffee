describe 'simditor-mention', ->
  editor = null
  $editor_content = null
  item_opts = 
    items:[{
      id:1
      name:"春雨"
      pinyin:"chunyu"
      abbr:"cy"
      url:"http://www.example.com"
    },{
      id:2
      name:"夏荷"
      pinyin:"xiahe"
      abbr:"xh"
    },{
      id:3
      name:"秋叶"
      pinyin:"qiuye"
      abbr:"qy"
    },{
      id:4
      name:"冬雪"
      pinyin:"dongxue"
      abbr:"dx"
    }]
  beforeEach ->
    $editor_content = $('<div id="editor" contenteditable="true"></div>').appendTo 'body'
    jasmine.clock().install()

  afterEach ->
    jasmine.clock().uninstall()
    editor?.destroy()
    editor = null
    $editor_content.remove()
    $editor_content = null

  describe 'render items', ->
    it 'should render mention popover by setting items', ->
      editor = spec.initEditor(item_opts)
      spec.simulationMention(editor, '@')
      expect($('.simditor .simditor-mention-popover')).toBeVisible()

  describe 'select item', ->
    beforeEach ->
      editor = spec.initEditor(item_opts)
      spec.simulationMention(editor, '@')
    it 'should set first item active by default', ->
      expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe true

    it 'should change active item by arrows', ->
      spec.simulateKeyDown(editor, 'down')
      expect($(".simditor-mention-popover .item[data-pinyin='xiahe']").is('.selected')).toBe true
      spec.simulateKeyDown(editor, 'up')
      expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe true

    it 'should select active item by enter', ->
      spec.simulateKeyDown(editor, 'enter')
      $mention = $(".simditor-body a.simditor-mention")
      expect($mention).toBeVisible()
      expect($mention.attr('href')).toBe('http://www.example.com')
      expect($mention.data('mention')).toBe(true)

    it 'should select active item by tab', ->
      spec.simulateKeyDown(editor, 'down')
      spec.simulateKeyDown(editor, 'down')
      spec.simulateKeyDown(editor, 'tab')
      $mention = $(".simditor-body a.simditor-mention")
      expect($mention).toBeVisible()
      expect($mention.attr('href')).toBe('javascript:;')
      expect($mention.data('mention')).toBe(true)

    it 'should select item by click', ->
      $(".simditor-mention-popover .item[data-pinyin='qiuye']").trigger 'mousedown'
      $mention = $(".simditor-body a.simditor-mention")
      expect($mention).toBeVisible()
      expect($mention.data('mention')).toBe(true)

    it 'should hide popover by space', ->
      spec.simulateKeyDown(editor, 'space')
      expect($('.simditor .simditor-mention-popover')).toBeHidden()

    it 'should refresh items by delete', ->
      spec.simulationMention(editor, '@春')
      spec.simulateKeyDown(editor, 'delete')
      expect($('.simditor .simditor-mention-popover')).toBeVisible()
      expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe true

    it 'should screening the results by pinyin', ->
      $('.simditor-body span.simditor-mention').append('q')
      editor.mention.filterItem();
      expect($('.simditor .simditor-mention-popover')).toBeVisible()
      expect($(".simditor-mention-popover .item[data-pinyin='qiuye']").is('.selected')).toBe true

    it 'should screening the results by character', ->
      $('.simditor-body span.simditor-mention').append('冬')
      editor.mention.filterItem();
      expect($('.simditor .simditor-mention-popover')).toBeVisible()
      expect($(".simditor-mention-popover .item[data-pinyin='dongxue']").is('.selected')).toBe true

  describe 'render content', ->
    beforeEach ->
      editor = spec.initEditor(item_opts)
      spec.simulationMention(editor, '@')
      spec.simulateKeyDown(editor, 'enter')

    it 'should render popover when click rendered content', ->
      $('a.simditor-mention').trigger 'mousedown'
      expect($('.simditor .simditor-mention-popover')).toBeVisible()

spec = 
  KEY:
    up: 38
    down: 40
    enter: 13
    tab: 9
    space: 32
    'delete': 8
  initEditor: (opts)->
    new Simditor
      textarea: $('#editor')
      placeholder: '这里输入文字...'
      pasteImage: true
      toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent']
      mention:
        opts
  simulationMention: (editor, text)->
    editor.setValue text
    editor.focus()
    range = document.createRange()
    range.setStart editor.body.find('p')[0], 1
    range.setEnd editor.body.find('p')[0], 1
    editor.selection.range range
    editor.body.trigger 
      type: 'keypress'
      which: '@'.charCodeAt(0)
    jasmine.clock().tick(51)

  simulateKeyDown: (editor, key)->
    editor.body.trigger 
      type: 'keydown'
      which: @KEY[key]

