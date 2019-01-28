class SimditorMention extends SimpleModule

  @pluginName: 'Mention'

  opts:
    mention: false

  active: false

  keys:
    BACKSPACE: 8
    TAB: 9
    ENTER: 13
    SHIFT: 16
    CTRL: 17
    ALT: 18
    ESC: 27
    SPACE: 32
    LEFT: 37
    UP: 38
    RIGHT: 39
    DOWN: 40

  _init: ->
    return unless @opts.mention
    @editor = @_module
    @opts.mention = $.extend
      items: []
      url: ''
      nameKey: "name"
      pinyinKey: "pinyin"
      abbrKey: "abbr"
      itemRenderer: null
      linkRenderer: null
    , @opts.mention

    throw new Error "Must provide items or source url" if !$.isArray(@opts.mention.items) and @opts.mention.url is ""

    @items = []

    if @editor.formatter._allowedAttributes['a']
      @editor.formatter._allowedAttributes['a'].push 'data-mention'
    else
      @editor.formatter._allowedAttributes['a'] = ['data-mention']

    if @opts.mention.items.length > 0
      @items = @opts.mention.items
      @_renderPopover()
    else
      @getItems()

  _bind: ->
    @editor.on 'decorate', (e,$el)=>
      $el.find('a[data-mention]').each (i,link)=>
        @decorate $(link)

    @editor.on 'undecorate', (e,$el)=>
      $el.find('a[data-mention]').each (i,link)=>
        @undecorate $(link)

      $el.find('simditor-mention').children().unwrap()

    @editor.on 'pushundostate', (e)=>
      return false if @editor.body.find('span.simditor-mention').length > 0
      e.result

    @editor.on('keydown.simditor-mention', $.proxy(@_onKeyDown, this))
    @editor.on('keyup.simditor-mention', $.proxy(@_onKeyUp, this))

    @editor.on 'blur',=>
      @hide() if @active

    @editor.body.on 'mousedown', 'a.simditor-mention', (e)=>

      $link = $(e.currentTarget)

      $target = $('<span class="simditor-mention edit" />')
        .append($link.contents())

      $link.replaceWith $target

      @show $target
      $textNode = $target.contents().eq(0)
      range = document.createRange()
      range.selectNodeContents $textNode[0]
      range.setStart range.startContainer, 1
      @editor.selection.range range
      false

    @editor.wrapper.on 'mousedown.simditor-mention', (e)=>
      return if $(e.target).closest('.simditor-mention-popover', @editor.wrapper).length
      @hide()

  _renderPopover: ->
    @popoverEl = $('''
      <div class='simditor-mention-popover'>
        <div class='items'></div>
      </div>
    ''').appendTo @editor.el

    $itemsEl = @popoverEl.find '.items'
    for item in @items
      name = item[@opts.mention.nameKey]
      pinyin = item[@opts.mention.pinyinKey]
      abbr = item[@opts.mention.abbrKey]

      $itemEl = $("""
        <a class="item" href="javascript:;"
          data-pinyin="#{ pinyin }"
          data-abbr="#{ abbr }">
          <span></span>
        </a>
      """)

      $itemEl.attr("data-name", name)
        .find("span").text(name)

      if @opts.mention.itemRenderer
        $itemEl = @opts.mention.itemRenderer($itemEl,item)

      $itemEl.appendTo($itemsEl).data 'item',item

    @popoverEl.on 'mouseenter', '.item', (e)->
      $(@).addClass 'selected'
        .siblings '.item'
        .removeClass 'selected'
    @popoverEl.on 'mousedown','.item', (e)=>
      @selectItem()
      false

    $itemsEl.on 'mousewheel', (e,delta)->
      $(@).scrollTop $(@).scrollTop() - 10*delta
      false

    @_bind()

  _changeFocus: (type)->
    selectedItem = @popoverEl.find '.item.selected'
    if selectedItem.length < 1
      @popoverEl.find('.item:first').addClass 'selected'
      return false
    itemEl = selectedItem[type + 'All']('.item:visible').first()
    return false if itemEl.length < 1
    selectedItem.removeClass 'selected'
    itemEl.addClass 'selected'

    parentEl = itemEl.parent()
    parentH = parentEl.height()

    position = itemEl.position()
    itemH = itemEl.outerHeight()

    if position.top > parentH - itemH
      parentEl.scrollTop( itemH * itemEl.prevAll('.item:visible').length - parentH + itemH )
    if position.top < 0
      parentEl.scrollTop( itemH * itemEl.prevAll('.item:visible').length )

  _onKeyDown: (e)->
    return unless @active

    switch e.which
      when @keys.UP, @keys.DOWN, @keys.TAB, @keys.ENTER
        e.preventDefault()

      when @keys.BACKSPACE
        if @target.text() is '@' or @target.text() is ''
          node = document.createTextNode '@'
          @target.replaceWith node
          @hide()
          @editor.selection.setRangeAtEndOf node
        else
          @filterItem()
          @refresh()

    e.stopPropagation()

  _onKeyUp: (e)->
    range = @editor.selection.range()
    return unless range? and range.collapsed
    range = range.cloneRange()
    range.setStart range.startContainer, Math.max(range.startOffset - 1, 0)

    if range.toString() is '@' and not @active
      $closestBlock = @editor.selection.blockNodes().last()
      return if $closestBlock.is 'pre'

      range = @editor.selection.range()
      return unless range?

      range = range.cloneRange()
      range.setStart range.startContainer, Math.max(range.startOffset - 2, 0)
      return if /^[A-Za-z0-9]@/.test range.toString()
      @show()

    return unless @active

    switch e.which
      when @keys.SHIFT, @keys.CTRL, @keys.ALT
        e.preventDefault()

      when @keys.LEFT, @keys.RIGHT, @keys.ESC
        @editor.selection.save()
        @hide()
        @editor.selection.restore()

      when @keys.UP
        @_changeFocus('prev')

      when @keys.DOWN
        @_changeFocus('next')

      when @keys.TAB, @keys.ENTER
        selectedItem = @popoverEl.find '.item.selected'
        if selectedItem.length
          @selectItem()
        else
          node = document.createTextNode @target.text()
          @target.before(node).remove()
          @hide()
          @editor.selection.setRangeAtEndOf node

      else
        @filterItem()
        @refresh()

  getItems: ->
    $.ajax
      type: 'get'
      url: @opts.mention.url
    .done (result)=>
      @items = result
      @_renderPopover()

  show: ($target)->
    @active = true
    if $target
      @target = $target
    else
      @target = $('<span class="simditor-mention" />')
      range = @editor.selection.range()
      range.setStart range.startContainer, range.endOffset - 1
      range.surroundContents @target[0]

    @editor.selection.setRangeAtEndOf @target, range

    @popoverEl.find('.item:first')
      .addClass 'selected'
      .siblings '.item'
      .removeClass 'selected'

    @popoverEl.show()
    @popoverEl.find('.item').show()
    @popoverEl.find('.items').scrollTop(0)
    @refresh()

  refresh: ->
    wrapperOffset = @editor.wrapper.offset()
    targetOffset = @target.offset()
    popoverH = @popoverEl.height()

    top = targetOffset.top - wrapperOffset.top + @target.height() + 2

    if targetOffset.top - $(document).scrollTop() + popoverH > $(window).height()
      top = targetOffset.top - wrapperOffset.top - popoverH

    @popoverEl.css
      top: top
      left: targetOffset.left - wrapperOffset.left + @target.width()

  decorate: ($link)->
    $link.addClass 'simditor-mention'

  undecorate: ($link)->
    $link.removeClass 'simditor-mention'

  hide: ->
    if @target
      @target.contents().first().unwrap()
      @target = null

    @popoverEl.hide()
    .find '.item'
    .removeClass 'selected'
    @active = false
    null

  selectItem: ->
    $selectedItem = @popoverEl.find '.item.selected'
    return unless $selectedItem.length > 0
    data = $selectedItem.data 'item'
    href = data.url || "javascript:;"
    $itemLink = $('<a/>',{
        'class':'simditor-mention'
        text: '@' + $selectedItem.attr('data-name')
        href: href
        'data-mention': true
    })

    @target.replaceWith $itemLink
    @editor.trigger "mention",[$itemLink,data]
    if @opts.mention.linkRenderer
      @opts.mention.linkRenderer($itemLink,data)

    if @target.hasClass 'edit'
      @editor.selection.setRangeAfter $itemLink
    else
      spaceNode = $('<span>&nbsp;</span>')
      $itemLink.after spaceNode
      range = document.createRange()
      @editor.selection.setRangeAtEndOf spaceNode, range

    @editor.sync()
    @hide()

  filterItem: ->
    val = @target.text().toLowerCase().substr(1).replace /'/g, ''
    # 处理输入法占位符号 rime:12288, sougou: 160
    val = val.replace String.fromCharCode(12288), ''
    val = val.replace String.fromCharCode(160), ''

    # 去掉中文输入时，字之间出现的空格
    val = val.split(' ').join('')

    try
      re = new RegExp "(|\\s)#{val}", 'i'
    catch e
      re = new RegExp '','i'

    $itemEls = @popoverEl.find '.item'
    results = $itemEls.hide().removeClass('selected').filter (i)->
      $el = $(@)
      str = [$el.data('name'),$el.data('pinyin'),$el.data('abbr')].join " "
      return re.test str
    if results.length
      @popoverEl.show()
      results.show()
      .first()
      .addClass 'selected'
    else
      @popoverEl.hide()

Simditor.connect SimditorMention
