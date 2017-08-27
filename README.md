
wxRichText

a lib to render html string in wechat tiny program

写这个库的目的是在小程序中渲染HTML字符串，虽然微信小程序官方提供了富文本组件，
但是仅支持20个标签，不支持style样式渲染，而且只要标签不合法，所有子节点将被删除，
也就是说传一个类似'<html>xxx</html>'的字符串的话就整个空白了，使用该库可以在
小程序里安全地渲染HTML字符串 

使用方法如下：

example.js:

var wxRichText = require('./wxRichText/wxRichText')

var htmlString = `
<html>
  <head>
    <style>
      body { padding: 20px; }
      .container { margin: 0 auto; }
      .container .title { font-size: 24px; }
      .container p { margin: 16px 0; color: #333; }
      p.red { color: red; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="title">这是标题</h1>
      <div class="content">
        <p>这是正文</p>
        <p class="red">这是红色文本</p>
      </div>
    </div>
  </body>
</html>
`

wxRichText(htmlString, function(nodes){
  self.setData({
    nodes: nodes
  })
})

example.wxml
<rich-text nodes="{{nodes}}" />



