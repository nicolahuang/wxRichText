var cssparser = require('./3rd/cssparser.js');
var cheerio = require('./3rd/cheerio');
var SPECIFICITY = require('./3rd/specificity');

function richText(htmlString, callback) {
  if (!htmlString) {
    return
  }

  var stringRe = /<style([\S\s]*?)>([\S\s]*?)<\/style>/ig;
  var scriptRe = /<script([\S\s]*?)>([\S\s]*?)<\/script>/ig;
  var myArray;
  var styleList = [];
  while ((myArray = stringRe.exec(htmlString)) !== null) {
    styleList.push(myArray[2]);
  }

  var styleString = '';
  styleList.forEach(function (style) {
    styleString += style;
  });

  var cssObj = {}
  try {
    styleString = styleString.replace(/<[^>]*>/g, "");
    var startDate = +new Date
    var cssObj = cssparser(styleString, {
      silent: true
    });
    var endDate = +new Date
    console.log('css parser takes ', endDate - startDate, ' ms')
  } catch (e) {
    var cssObj = cssparser("", {});
  }

  var rawHtml = htmlString.replace(stringRe, '').replace(scriptRe, '')

  rawHtml = rawHtml.trim()

  if (rawHtml.trim() == '') {
    callback([])
    return
  }
  
  var $ = cheerio.load(rawHtml, { decodeEntities: false });

  if (cssObj && cssObj.stylesheet && cssObj.stylesheet.rules) {
    cssObj.stylesheet.rules.forEach(function (rule, index) {
      if (!rule.selectors) {
        return
      }
      var declarations = rule.declarations;

      rule.selectors.forEach((selector) => {
        try {
          var selectedDomList = $(selector)
          for (var i = selectedDomList.length - 1; i >= 0; i--) {
            var item = selectedDomList[i]
            declarations.forEach(function (dec, index) {
              var cssObj = {}
              if (!item.selectorsMap) {
                item.selectorsMap = {}
              }
              if (!item.selectorsMap[dec['property']]) {
                cssObj[dec['property']] = dec['value']
                item.selectorsMap[dec['property']] = selector
              } else {
                var preSelector = item.selectorsMap[dec['property']]
                if (SPECIFICITY.compare(selector, preSelector) >= 0) {
                  cssObj[dec['property']] = dec['value']
                  item.selectorsMap[dec['property']] = selector
                }
              }
              $(item).css(cssObj)
            });
          }
        } catch (e) {
          // console.log(e)
        }
      })
    })
  }

  var nodes = []
  function makeMap(arr) {
    var obj = {}
    arr.forEach((item) => {
      obj[item] = true
    })
    return obj
  }

  var empty = makeMap(["area", "base", "basefont", "br", "col", "frame", "hr", "img", "input", "link", "meta", "param", "embed", "command", "keygen", "source", "track", "wbr"])

  // Block Elements - HTML 5
  var block = makeMap(["address", "article", "aside", "blockquote", "canvas", "dd", "div", "dl", "dt", "fieldset", "figcaption", "figure", "figcaption", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "li", "main", "nav", "noscript", "ol", "output", "p", "pre", "section", "table", "tfoot", "ul", "video"])

  // Inline Elements - HTML 5
  var inline = makeMap(["a", "b", "big", "i", "small", "tt", "abbr", "acronym", "cite", "code", "dfn", "em", "kbd", "strong", "samp", "time", "var", "bdo", "br", "img", "map", "object", "q", "script", "span", "sub", "sup", "button", "input", "label", "select", "textarea"])

  // whiteTag
  var whiteTag = makeMap(["a", "abbr", "b", "blockquote", "br", "code", "col", "colgroup", "dd", "del", "div", "dl", "dt", "em", "fieldset", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins", "label", "legend", "li", "ol", "p", "q", "span", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul"])

  function parserDomTree(node, parent) {
    if (!node) {
      return
    }
    if (node.length > 0) {
      var len = node.length
      for (var i = 0; i < len; ++i) {
        parserDomTree(node[i], parent)
      }
      return
    }
    var newNode, nodeName
    if (node.type == 'text') {
      newNode = {
        type: 'text',
        text: node.data
      }
    } else if (!whiteTag[node.name]) {
      if (inline[node.name]) {
        nodeName = 'span'
      } else {
        nodeName = 'div'
      }
      newNode = {
        type: 'node',
        name: nodeName,
        attrs: getRichTextAttr(node)
      }
    } else {
      newNode = {
        type: 'node',
        name: node.name,
        attrs: getRichTextAttr(node)
      }
    }

    if (!parent) {
      nodes.push(newNode)
    } else {
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(newNode)
    }

    if (node.children && node.children.length) {
      var children = node.children
      var len = children.length
      for (var i = 0; i < len; ++i) {
        parserDomTree(children[i], newNode)
      }
    }
  }

  function getRichTextAttr(node) {
    if (!node.attribs) {
      return {}
    }
    var attrs = {}, attribs = node.attribs
    if (attribs.class) {
      attrs.class = attribs.class
    }
    if (attribs.style) {
      attrs.style = attribs.style
    }
    if (node.name == 'col' || node.name == 'colgroup') {
      attribs.span && (attrs.span = attribs.span)
      attribs.width && (attrs.width = attribs.width)
    }
    else if (node.name == 'img') {
      attribs.alt && (attrs.alt = attribs.alt)
      attribs.src && (attrs.src = attribs.src)
      attribs.height && (attrs.height = attribs.height)
      attribs.width && (attrs.width = attribs.width)
    }
    else if (node.name == 'ol') {
      attribs.start && (attrs.start = attribs.start)
      attribs.type && (attrs.type = attribs.type)
    }
    else if (node.name == 'table') {
      attribs.width && (attrs.width = attribs.width)
    }
    else if (node.name == 'td' || node.name == 'th') {
      attribs.colspan && (attrs.colspan = attribs.colspan)
      attribs.rowspan && (attrs.rowspan = attribs.rowspan)
      attribs.height && (attrs.height = attribs.height)
      attribs.width && (attrs.width = attribs.width)
    }
    return attrs
  }

  parserDomTree($.root())

  callback(nodes)
}

module.exports = richText;
