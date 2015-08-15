window.spec = 
  item_opts:
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