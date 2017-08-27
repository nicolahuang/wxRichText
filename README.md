
wxRichText

a lib to render html string in wechat tiny program

写这个库的目的是在小程序中渲染HTML字符串，虽然微信小程序官方提供了富文本组件，
但是仅支持20个标签，不支持style样式渲染，而且只要标签不合法，所有子节点将被删除，
也就是说传一个类似'<html>xxx</html>'的字符串的话就整个空白了，使用该库可以在
小程序里安全地渲染HTML字符串 

使用方法如下：


<pre>
example.js:

var wxRichText = require('./wxRichText/wxRichText')

var htmlString = `
  &lt;html&gt;
  &lt;head&gt;
    &lt;style&gt;
      body { padding: 20px; }
      .container { margin: 0 auto; }
      .container .title { font-size: 24px; }
      .container p { margin: 16px 0; color: #333; }
      p.red { color: red; }
    &lt;/style&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;div class="container"&gt;
      &lt;h1 class="title"&gt;这是标题&lt;/h1&gt;
      &lt;div class="content"&gt;
        &lt;p&gt;这是正文&lt;/p&gt;
        &lt;p class="red"&gt;这是红色文本&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/body&gt;
&lt;/html&gt;
`

wxRichText(htmlString, function(nodes){
  self.setData({
    nodes: nodes
  })
})

example.wxml
<rich-text nodes="{{nodes}}" />

</pre>
