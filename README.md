simditor-mention
=================

[Simditor](http://simditor.tower.im/) 的官方扩展，可以轻松的@他人.

## 如何使用

- 在 Simditor 的基础上额外引用 simditor-mention 的脚本。

  ```html
  <script src="/assets/javascripts/simditor-mention.js"></script>
  ```

- 配置

  ```javascript
  new Simditor({
  	textarea: textareaElement,
  	...,
  	mention: true,
    mentionMembers:[{}...], //(可选)
    mentionSource:"", //(与mentionMembers二选一)
    mentionUrlGenerator:function(id){} //(可选),用于配置生成的a连接的href属性
  })

  //示例:
  new Simditor{
    ...,
    mention:true,
    mentionMembers:[
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
    mentionUrlGenerator:function(id){ return "http://www.example.com"+"/members/"+id }
  }
  ```

## 说明

- 首先将mention属性设置为true打开mention功能

- 可以以两种方式提供member对象的信息,mentionMembers属性如果存在则会被使用,如果不存在,则请求mentionSource获取数据

- mentionMembers和mentionSource都不存在的情况下,会抛出错误.

- 每一个member对象的信息如下:

  ```javascript
  mentionMember:
  {
    id:1 // (可选)
    name:'春雨' // (必要),a链接中的文本,同时也用来匹配
    pinyin:'chunyu' // (可选),用来匹配人名
    abbr:'cy' // (可选),用来匹配人名
  }
  ```

- 可以传入一个函数来配置生成的a连接的href属性,函数的参数为member的id(string),如果不提供,则a的href属性为`javascript:;`

- 匹配时会根据name,pinyin,abbr来进行,中英文字符下均可以进行匹配









