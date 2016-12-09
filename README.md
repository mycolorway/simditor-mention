ts-simditor-mention
=================

This is Townsquared's plugin for the [Simditor](http://simditor.tower.im/) project.

Forked from [simditor-mention](https://github.com/mycolorway/simditor-mention)

**Note**: This is WIP, and not ready for your production usage just yet.

## Download

Download or clone this repo and copy over files from the `lib/` and `styles/` directory

or via bower:
```sh
bower install --save ts-simditor-mention
```

## Install

Include the assets in your html file

```html
<script src="/assets/javascripts/simditor-mention.js"></script>
<link rel="stylesheet" type="text/css" href="styles/simditor-mention.css" />
```

or if you are using sass:

```scss
@import 'ts-simditor-mention/styles/simditor-mention.scss';
```

## Setup

```js
  
  new Simditor{
    ...,
    mention:{
      xhrUrl: '/api/',
      xhrHeaders: {},
      xhrData: {},
      xhrResponseFormat(data) {
        return format(data);
      }
    }
  }
```
