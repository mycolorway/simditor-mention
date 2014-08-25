simditor-mention
=================

[Simditor](http://simditor.tower.im/) 的官方扩展，可以轻松的@他人.

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
    ...
  }
  ```

- 如果item被@,simditor对象会触发`mention`事件,附带相应的item对象及对应的a标签作为参数.

- 具体使用请参考demo.html








