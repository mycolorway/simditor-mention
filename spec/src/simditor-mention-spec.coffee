describe 'simditor-mention', ->
  editor = null
  $editor_content = null

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
      editor = window.spec.initEditor(window.spec.item_opts)
      window.spec.simulationMention(editor, '@')
      expect($('.simditor .simditor-mention-popover')).toBeVisible()

  describe 'select item', ->
    beforeEach ->
      editor = window.spec.initEditor(window.spec.item_opts)
      window.spec.simulationMention(editor, '@')
    it 'should set first item active by default', ->
      expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe true

    it 'should change active item by arrows', ->
      window.spec.simulateKeyDown(editor, 'down')
      expect($(".simditor-mention-popover .item[data-pinyin='xiahe']").is('.selected')).toBe true
      window.spec.simulateKeyDown(editor, 'up')
      expect($(".simditor-mention-popover .item[data-pinyin='chunyu']").is('.selected')).toBe true

    it 'should select active item by enter', ->
      window.spec.simulateKeyDown(editor, 'enter')
      $mention = $(".simditor-body a.simditor-mention")
      expect($mention).toBeVisible()
      expect($mention.attr('href')).toBe('http://www.example.com')
      expect($mention.data('mention')).toBe(true)

    it 'should select active item by tab', ->
      window.spec.simulateKeyDown(editor, 'down')
      window.spec.simulateKeyDown(editor, 'down')
      window.spec.simulateKeyDown(editor, 'tab')
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
      window.spec.simulateKeyDown(editor, 'space')
      expect($('.simditor .simditor-mention-popover')).toBeHidden()

    it 'should refresh items by delete', ->
      window.spec.simulationMention(editor, '@春')
      window.spec.simulateKeyDown(editor, 'delete')
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
      editor = window.spec.initEditor(window.spec.item_opts)
      window.spec.simulationMention(editor, '@')
      window.spec.simulateKeyDown(editor, 'enter')

    it 'should render popover when click rendered content', ->
      $('a.simditor-mention').trigger 'mousedown'
      expect($('.simditor .simditor-mention-popover')).toBeVisible()

