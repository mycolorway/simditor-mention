class Mention extends Plugin

  opts:
    mention: false
    mentionMembers: []
    mentionSource: ""
    mentionUrlGenerator:null

  members:null

  active: false


  constructor: (args...) ->
    super args...
    @editor = @widget

  _init: ->
    return unless @opts.mention
    throw new Error "Must provide items or items source url" if @opts.mentionMembers.length == 0 and @opts.mentionSource.length == 0

    if @opts.mentionMembers.length > 0
      @members = @opts.mentionMembers
      @_renderPopover()
    else
      @getMembers()

    @_bind()

  getMembers: ->
    $.ajax
      type: 'get'
      url: @opts.mentionSource
    .done (result)=>
      @members = result
      @_renderPopover()

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


    @editor.on 'keydown', (e)=>
      return unless e.which == 229

      setTimeout =>
        range = @editor.selection.getRange()
        return unless range? and range.collapsed
        range = range.cloneRange()
        range.setStart range.startContainer, Math.max(range.startOffset - 1, 0)
        if range.toString() == '@'
          @editor.trigger $.Event('keypress'),{
            which: 64
          }
      , 0

    @editor.on 'keypress', (e)=>
      return unless e.which == 64

      $closestBlock = @editor.util.closestBlockEl()
      return if $closestBlock.is 'pre'

      setTimeout =>
        range = @editor.selection.getRange()
        return unless range?

        range = range.cloneRange()
        range.setStart range.startContainer, Math.max(range.startOffset - 2, 0)
        return if /^[A-Za-z0-9]@/.test range.toString()
        @show()

    @editor
      .on('keydown.simditor-mention', $.proxy(@_onKeyDown, this))
      .on('keyup.simditor-mention', $.proxy(@_onKeyUp, this))


    @editor.on 'blur',=>
      @hide() if @active

    @editor.body.on 'mousedown', 'a.simditor-mention', (e)=>

      $link = $(e.currentTarget)

      $target = $('<span class="simditor-mention edit" />')
        .append($link.contents())
      $link.replaceWith $target
      @show $target
      # @filterMember()
      $textNode = $target.contents().eq(0)
      range = document.createRange()
      range.selectNodeContents $textNode[0]
      range.setStart range.startContainer, 1
      @editor.selection.selectRange range
      false

    @editor.wrapper.on 'mousedown.simditor-mention', (e)=>
      return if $(e.target).closest('.simditor-mention-popover', @editor.wrapper).length
      @hide()




  show: ($target)->
    @active = true
    if $target
      @target = $target
    else
      @target = $('<span class="simditor-mention" />')
      range = @editor.selection.getRange()
      range.setStart range.startContainer, range.endOffset - 1
      range.surroundContents @target[0]

    @editor.selection.setRangeAtEndOf @target, range

    @popoverEl.find('.member:first')
      .addClass 'selected'
      .siblings '.member'
      .removeClass 'selected'

    @popoverEl.show()
    @popoverEl.find('.member').show()
    @refresh()

  refresh: ->
    wrapperOffset = @editor.wrapper.offset()
    targetOffset = @target.offset()

    @popoverEl.css
      top: targetOffset.top - wrapperOffset.top + @target.height() + 2
      left: targetOffset.left - wrapperOffset.left + @target.width()

  _renderPopover: ->
    @popoverEl = $('''
      <div class='simditor-mention-popover'>
        <div class='members'></div>
      </div>
    ''').appendTo @editor.el

    $membersEl = @popoverEl.find '.members'
    for member in @members
      $memberEl = $("""
        <a class="member" href="javascript:;"
          data-id="#{ member.id }"
          data-name="#{ member.name }"
          data-pinyin="#{ member.pinyin ? "" }"
          data-abbr="#{ member.abbr ? "" }" >
          <span>#{ member.name }</span>
        </a>
      """).appendTo $membersEl
    @popoverEl.on 'mouseenter', '.member', (e)->
      $(@).addClass 'selected'
        .siblings '.member'
        .removeClass 'selected'
    @popoverEl.on 'mousedown','.member', (e)=>
      @selectMember()
      false

    $membersEl.on 'mousewheel', (e,delta)->
      $(@).scrollTop $(@).scrollTop() - 10*delta
      false

  decorate: ($link)->
    $link.addClass 'simditor-mention'

  undecorate: ($link)->
    $link.removeClass 'simditor-mention'


  hide: ->
    if @target
      @target.contents().first().unwrap()
      @target = null

    @popoverEl.hide()
    .find '.member'
    .removeClass 'selected'
    @active = false
    null


  selectMember: ->

    selectedMember = @popoverEl.find '.member.selected'
    return unless selectedMember.length > 0
    if @opts.mentionUrlGenerator
      url = @opts.mentionUrlGenerator(selectedMember.attr('data-id'))
    else
      url = "javascript:;"
    $memberLink = $('<a/>',{
        'class':'simditor-mention'
        'data-id':selectedMember.attr('data-id')
        text: '@' + selectedMember.attr('data-name')
        href: url
        'data-mention': true
    })

    @target.replaceWith $memberLink

    if @target.hasClass 'edit'
      @editor.selection.setRangeAfter $memberLink
    else
      spaceNode = document.createTextNode '\u00A0'
      $memberLink.after spaceNode
      range = document.createRange()
      @editor.selection.setRangeAtEndOf spaceNode, range

    @hide()

  filterMember: ->
    val = @target.text().toLowerCase().substr(1).replace /'/g, ''
    try
      re = new RegExp val, 'i'
    catch e
      re = new RegExp '','i'

    $memberEls = @popoverEl.find '.member'
    results = $memberEls.hide().removeClass('selected').filter (i)->
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

  _onKeyDown: (e)->
    return unless @active

    # left and right arrow
    if e.which == 37 or e.which == 39 or e.which == 27
      @editor.selection.save()
      @hide()
      @editor.selection.restore()
      return false

    #up and down arrow
    else if e.which == 38 or e.which == 40

      selectedMember = @popoverEl.find '.member.selected'
      if selectedMember.length < 1
        @popoverEl.find '.member:first' .addClass 'selected'
        return false

      memberEl = selectedMember[if e.which == 38 then 'prev' else 'next']('.member:visible')
      if memberEl.length > 0
        selectedMember.removeClass 'selected'
        memberEl.addClass 'selected'

        parentEl = memberEl.parent()
        position = memberEl.position()
        parentH = parentEl.height()
        memberH = memberEl.outerHeight()

        if position.top < 0
          parentEl.scrollTop(memberH * memberEl.prevAll('.member').length)
        else if position.top > parentH - memberH
          parentEl.scrollTop(memberH * memberEl.prevAll('.member').length - parentH + memberH )
      return false

    #enter or tab to select member
    else if e.which == 13 or e.which == 9
      selectedMember = @popoverEl.find '.member.selected'
      if selectedMember.length > 0
        @selectMember()
        return false
      else
        node = document.createTextNode @target.text()
        @target.before(node).remove()
        @hide()
        @editor.selection.setRangeAtEndOf node
    else if e.which == 8 and @target.text() == '@'
      node = document.createTextNode '@'
      @target.replaceWith node
      @hide()
      @editor.selection.setRangeAtEndOf node

    else if e.which == 32
      node = document.createTextNode @target.text() + '\u00A0'
      @target.before(node).remove()
      @hide()
      @editor.selection.setRangeAtEndOf node
      return false

  _onKeyUp: (e)->
    return if !@active or $.inArray(e.which, [9,16,50,27,37,38,39,40,32]) > -1
    @filterMember()
    @refresh()

Simditor.connect Mention















