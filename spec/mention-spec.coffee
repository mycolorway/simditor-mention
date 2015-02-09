describe 'Simditor-mention', ->
  $textarea = null
  editor = null
  items = [
    id:1
    name:"春雨"
    pinyin:"chunyu"
    abbr:"cy"
    url:"http://www.example.com"
  ,
    id:2,
    name:"夏荷"
    pinyin:"xiahe"
    abbr:"xh"
  ,
    id:3
    name:"秋叶"
    pinyin:"qiuye"
    abbr:"qy"
  ]

  initTypicalEditor = (option = null) ->
    option = $.extend
        items: items
    , option

    editor = new Simditor
      textarea: '#editor'
      mention: option

    editor.setValue '@'
    editor.focus()

    #set caret position
    range = document.createRange()
    range.setStart editor.body.find('p')[0], 1
    range.setEnd editor.body.find('p')[0], 1

    editor.selection.selectRange range
    #patch, may from a bug
    editor.inputManager.focused = true

    e = $.Event('keypress', {which: 64})
    editor.body.trigger e

    jasmine.clock().tick(1)

  beforeEach ->
    $textarea = $('<textarea id="editor"></textarea>').appendTo 'body'
    jasmine.clock().install()

  afterEach ->
    jasmine.clock().uninstall()
    editor?.destroy()
    editor = null
    $textarea.remove()
    $textarea = null

  it 'should render mention popover', ->
    initTypicalEditor()
    expect($('.simditor .simditor-mention-popover')).toBeVisible()

  xit 'should filter item based on abbr', ->
    initTypicalEditor()

    editor.body.sendkeys 'x'
    #force!!
    editor.mention.filterItem()
    expect($('.simditor .simditor-mention-popover [data-abbr=xh]')).toHaveClass('selected')

  it 'should change active item by arrows', ->
    initTypicalEditor()
    e = $.Event('keydown', {which: 40})
    editor.mention._onKeyDown e
    expect($('.simditor .simditor-mention-popover [data-abbr=xh]')).toHaveClass('selected')

    e = $.Event('keydown', {which: 38})
    editor.mention._onKeyDown e
    expect($('.simditor .simditor-mention-popover [data-abbr=cy]')).toHaveClass('selected')

  describe 'select item', ->
    it 'should render right content when no url', ->
      initTypicalEditor()
      $('.simditor .simditor-mention-popover [data-abbr=xh]').click()
      $link = editor.body.find('a')
      expect($link).toHaveAttr('data-mention')
      expect($link).toHaveClass('simditor-mention')
      expect($link).toContainText('@夏荷')
      expect($link).toHaveAttr('href', 'javascript:;')

    it 'should render right content when has url', ->
      initTypicalEditor()
      $('.simditor .simditor-mention-popover [data-abbr=cy]').click()
      $link = editor.body.find('a')
      expect($link).toHaveAttr('href', 'http://www.example.com')

    it 'should render popover when click rendered content', ->
      initTypicalEditor()
      $('.simditor .simditor-mention-popover [data-abbr=xh]').click()
      editor.body.find('a[data-mention]').mousedown()
      jasmine.clock().tick(1)
      expect($('.simditor .simditor-mention-popover')).toBeVisible()

   it 'should render special popover when itemRenderer on', ->
    option =
      itemRenderer: ($itemEl, data) ->
        $span = $('span',$itemEl)
        $('<img>').insertBefore($span)
        return $itemEl

    initTypicalEditor(option)
    expect($('.simditor .simditor-mention-popover .item img')).toExist()

  it 'should render special link when linkRenderer on', ->
    option =
      linkRenderer: ($link) ->
        $link.addClass('special')

    initTypicalEditor(option)
    $('.simditor .simditor-mention-popover [data-abbr=cy]').click()
    $link = editor.body.find('a')
    console.log $link[0]
    expect($link).toHaveClass('special')



