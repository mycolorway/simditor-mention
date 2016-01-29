simditor-mention
=================

[Simditor](http://simditor.tower.im/) 的@人扩展

## 如何使用

- 在 Simditor 的基础上额外引用 simditor-mention 的脚本以及css文件。

  ```html
  <script src="/assets/javascripts/simditor-mention.js"></script>
  <link rel="stylesheet" type="text/css" href="styles/simditor-mention.css" />
  ```

- 配置

  ```javascript
  new Simditor({
  	textarea: textareaElement,
  	...,
  	mention:{
      items:[{}...] //item数组
      url:"" //获取item数组的url,与items选项二选一
      nameKey:"" //(可选,默认为name),item中用来提供名称的键
      pinyinKey:"" //(可选,默认为pinyin),item中用来提供拼音的键
      abbrKey:"" //(可选,默认为abbr),item中用来提供缩写的键
      //名称,拼音以及缩写将会用来匹配
      itemRenderer:null //(可选),对弹出框的item进行自定义,例如添加img元素
      linkRender:null //(可选),对生成的a链接进行自定义
    },
  })

  //示例:
  new Simditor{
    ...,
    mention:{
      items:[
        {
          id:1,
          name:"春雨",
          pinyin:"chunyu",
          abbr:"cy",
          url:"http://www.example.com"
        },
        {
          id:2,
          name:"夏荷",
          pinyin:"xiahe",
          abbr:"xh",
        },
        {
          id:3,
          name:"秋叶",
          pinyin:"qiuye",
          abbr:"qy",
        },
        {
          id:4,
          name:"冬雪",
          pinyin:"dongxue",
          abbr:"dx",
        },
      ],
    }
  }
  ```

## 说明

- 在配置中提供mention对象将打开mention功能

- 可以以两种方式提供items信息,直接在对象中提供items数组或者提供url,simditor将ajax请求获取数据

- item对象大致如下:

  ```javascript
  item:
  {
    id:1 // (可选)
    name:'春雨' // (必要),a链接中的文本,同时也用来匹配
    pinyin:'chunyu' // (可选),用来匹配
    abbr:'cy' // (可选),用来匹配
    url:'' //(可选),生成a标签的默认url,如果不提供则为'javascript:;'
    ...
  }
  ```
- 动态添加at对象如下：

  ```javascript
  // 有时候我们在另外的地方new了simditor对象
  // 在当用户发了评论，我们需要动态的将at对象添加到simditor中
  editor.mention.items.push({"name":"moli"});
  editor.mention._init(); 
  ```
- 如果item被@,simditor对象会触发`mention`事件,附带对应的a标签及相应的item对象作为参数.

- 对于popover中的item,可以传入参数itemRenderer进行定制.

- 对于被@然后生成的a标签可以传入参数linkRenderer进行定制.

- 具体使用请参考demo.html
