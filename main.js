/*! Netdisk AI Notes Importer license:
MIT License

Copyright (c) 2026 不要黑眼圈

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/*! Bundled Turndown and turndown-plugin-gfm license:
MIT License

Copyright (c) 2017 Dom Christie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Plugin lifecycle and note operations.
var main_exports = {};
__export(main_exports, {
  default: () => NetdiskAiNotesPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// HTML to Markdown conversion.
var import_obsidian = require("obsidian");

// node_modules/.pnpm/turndown@7.2.4/node_modules/turndown/lib/turndown.browser.es.js
function extend(destination) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) destination[key] = source[key];
    }
  }
  return destination;
}
function repeat(character, count) {
  return Array(count + 1).join(character);
}
function trimLeadingNewlines(string) {
  return string.replace(/^\n*/, "");
}
function trimTrailingNewlines(string) {
  var indexEnd = string.length;
  while (indexEnd > 0 && string[indexEnd - 1] === "\n") indexEnd--;
  return string.substring(0, indexEnd);
}
function trimNewlines(string) {
  return trimTrailingNewlines(trimLeadingNewlines(string));
}
var blockElements = ["ADDRESS", "ARTICLE", "ASIDE", "AUDIO", "BLOCKQUOTE", "BODY", "CANVAS", "CENTER", "DD", "DIR", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "FRAMESET", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HGROUP", "HR", "HTML", "ISINDEX", "LI", "MAIN", "MENU", "NAV", "NOFRAMES", "NOSCRIPT", "OL", "OUTPUT", "P", "PRE", "SECTION", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "UL"];
function isBlock(node) {
  return is(node, blockElements);
}
var voidElements = ["AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
function isVoid(node) {
  return is(node, voidElements);
}
function hasVoid(node) {
  return has(node, voidElements);
}
var meaningfulWhenBlankElements = ["A", "TABLE", "THEAD", "TBODY", "TFOOT", "TH", "TD", "IFRAME", "SCRIPT", "AUDIO", "VIDEO"];
function isMeaningfulWhenBlank(node) {
  return is(node, meaningfulWhenBlankElements);
}
function hasMeaningfulWhenBlank(node) {
  return has(node, meaningfulWhenBlankElements);
}
function is(node, tagNames) {
  return tagNames.indexOf(node.nodeName) >= 0;
}
function has(node, tagNames) {
  return node.getElementsByTagName && tagNames.some(function(tagName) {
    return node.getElementsByTagName(tagName).length;
  });
}
var markdownEscapes = [[/\\/g, "\\\\"], [/\*/g, "\\*"], [/^-/g, "\\-"], [/^\+ /g, "\\+ "], [/^(=+)/g, "\\$1"], [/^(#{1,6}) /g, "\\$1 "], [/`/g, "\\`"], [/^~~~/g, "\\~~~"], [/\[/g, "\\["], [/\]/g, "\\]"], [/^>/g, "\\>"], [/_/g, "\\_"], [/^(\d+)\. /g, "$1\\. "]];
function escapeMarkdown(string) {
  return markdownEscapes.reduce(function(accumulator, escape) {
    return accumulator.replace(escape[0], escape[1]);
  }, string);
}
var rules = {};
rules.paragraph = {
  filter: "p",
  replacement: function(content) {
    return "\n\n" + content + "\n\n";
  }
};
rules.lineBreak = {
  filter: "br",
  replacement: function(content, node, options) {
    return options.br + "\n";
  }
};
rules.heading = {
  filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
  replacement: function(content, node, options) {
    var hLevel = Number(node.nodeName.charAt(1));
    if (options.headingStyle === "setext" && hLevel < 3) {
      var underline = repeat(hLevel === 1 ? "=" : "-", content.length);
      return "\n\n" + content + "\n" + underline + "\n\n";
    } else {
      return "\n\n" + repeat("#", hLevel) + " " + content + "\n\n";
    }
  }
};
rules.blockquote = {
  filter: "blockquote",
  replacement: function(content) {
    content = trimNewlines(content).replace(/^/gm, "> ");
    return "\n\n" + content + "\n\n";
  }
};
rules.list = {
  filter: ["ul", "ol"],
  replacement: function(content, node) {
    var parent = node.parentNode;
    if (parent.nodeName === "LI" && parent.lastElementChild === node) {
      return "\n" + content;
    } else {
      return "\n\n" + content + "\n\n";
    }
  }
};
rules.listItem = {
  filter: "li",
  replacement: function(content, node, options) {
    var prefix = options.bulletListMarker + "   ";
    var parent = node.parentNode;
    if (parent.nodeName === "OL") {
      var start = parent.getAttribute("start");
      var index = Array.prototype.indexOf.call(parent.children, node);
      prefix = (start ? Number(start) + index : index + 1) + ".  ";
    }
    var isParagraph = /\n$/.test(content);
    content = trimNewlines(content) + (isParagraph ? "\n" : "");
    content = content.replace(/\n/gm, "\n" + " ".repeat(prefix.length));
    return prefix + content + (node.nextSibling ? "\n" : "");
  }
};
rules.indentedCodeBlock = {
  filter: function(node, options) {
    return options.codeBlockStyle === "indented" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  },
  replacement: function(content, node, options) {
    return "\n\n    " + node.firstChild.textContent.replace(/\n/g, "\n    ") + "\n\n";
  }
};
rules.fencedCodeBlock = {
  filter: function(node, options) {
    return options.codeBlockStyle === "fenced" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  },
  replacement: function(content, node, options) {
    var className = node.firstChild.getAttribute("class") || "";
    var language = (className.match(/language-(\S+)/) || [null, ""])[1];
    var code = node.firstChild.textContent;
    var fenceChar = options.fence.charAt(0);
    var fenceSize = 3;
    var fenceInCodeRegex = new RegExp("^" + fenceChar + "{3,}", "gm");
    var match;
    while (match = fenceInCodeRegex.exec(code)) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1;
      }
    }
    var fence = repeat(fenceChar, fenceSize);
    return "\n\n" + fence + language + "\n" + code.replace(/\n$/, "") + "\n" + fence + "\n\n";
  }
};
rules.horizontalRule = {
  filter: "hr",
  replacement: function(content, node, options) {
    return "\n\n" + options.hr + "\n\n";
  }
};
rules.inlineLink = {
  filter: function(node, options) {
    return options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href");
  },
  replacement: function(content, node) {
    var href = escapeLinkDestination(node.getAttribute("href"));
    var title = escapeLinkTitle(cleanAttribute(node.getAttribute("title")));
    var titlePart = title ? ' "' + title + '"' : "";
    return "[" + content + "](" + href + titlePart + ")";
  }
};
rules.referenceLink = {
  filter: function(node, options) {
    return options.linkStyle === "referenced" && node.nodeName === "A" && node.getAttribute("href");
  },
  replacement: function(content, node, options) {
    var href = escapeLinkDestination(node.getAttribute("href"));
    var title = cleanAttribute(node.getAttribute("title"));
    if (title) title = ' "' + escapeLinkTitle(title) + '"';
    var replacement;
    var reference;
    switch (options.linkReferenceStyle) {
      case "collapsed":
        replacement = "[" + content + "][]";
        reference = "[" + content + "]: " + href + title;
        break;
      case "shortcut":
        replacement = "[" + content + "]";
        reference = "[" + content + "]: " + href + title;
        break;
      default:
        var id = this.references.length + 1;
        replacement = "[" + content + "][" + id + "]";
        reference = "[" + id + "]: " + href + title;
    }
    this.references.push(reference);
    return replacement;
  },
  references: [],
  append: function(options) {
    var references = "";
    if (this.references.length) {
      references = "\n\n" + this.references.join("\n") + "\n\n";
      this.references = [];
    }
    return references;
  }
};
rules.emphasis = {
  filter: ["em", "i"],
  replacement: function(content, node, options) {
    if (!content.trim()) return "";
    return options.emDelimiter + content + options.emDelimiter;
  }
};
rules.strong = {
  filter: ["strong", "b"],
  replacement: function(content, node, options) {
    if (!content.trim()) return "";
    return options.strongDelimiter + content + options.strongDelimiter;
  }
};
rules.code = {
  filter: function(node) {
    var hasSiblings = node.previousSibling || node.nextSibling;
    var isCodeBlock = node.parentNode.nodeName === "PRE" && !hasSiblings;
    return node.nodeName === "CODE" && !isCodeBlock;
  },
  replacement: function(content) {
    if (!content) return "";
    content = content.replace(/\r?\n|\r/g, " ");
    var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? " " : "";
    var delimiter = "`";
    var matches = content.match(/`+/gm) || [];
    while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + "`";
    return delimiter + extraSpace + content + extraSpace + delimiter;
  }
};
rules.image = {
  filter: "img",
  replacement: function(content, node) {
    var alt = escapeMarkdown(cleanAttribute(node.getAttribute("alt")));
    var src = escapeLinkDestination(node.getAttribute("src") || "");
    var title = cleanAttribute(node.getAttribute("title"));
    var titlePart = title ? ' "' + escapeLinkTitle(title) + '"' : "";
    return src ? "![" + alt + "](" + src + titlePart + ")" : "";
  }
};
function cleanAttribute(attribute) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, "\n") : "";
}
function escapeLinkDestination(destination) {
  var escaped = destination.replace(/([<>()])/g, "\\$1");
  return escaped.indexOf(" ") >= 0 ? "<" + escaped + ">" : escaped;
}
function escapeLinkTitle(title) {
  return title.replace(/"/g, '\\"');
}
function Rules(options) {
  this.options = options;
  this._keep = [];
  this._remove = [];
  this.blankRule = {
    replacement: options.blankReplacement
  };
  this.keepReplacement = options.keepReplacement;
  this.defaultRule = {
    replacement: options.defaultReplacement
  };
  this.array = [];
  for (var key in options.rules) this.array.push(options.rules[key]);
}
Rules.prototype = {
  add: function(key, rule) {
    this.array.unshift(rule);
  },
  keep: function(filter) {
    this._keep.unshift({
      filter,
      replacement: this.keepReplacement
    });
  },
  remove: function(filter) {
    this._remove.unshift({
      filter,
      replacement: function() {
        return "";
      }
    });
  },
  forNode: function(node) {
    if (node.isBlank) return this.blankRule;
    var rule;
    if (rule = findRule(this.array, node, this.options)) return rule;
    if (rule = findRule(this._keep, node, this.options)) return rule;
    if (rule = findRule(this._remove, node, this.options)) return rule;
    return this.defaultRule;
  },
  forEach: function(fn) {
    for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
  }
};
function findRule(rules3, node, options) {
  for (var i = 0; i < rules3.length; i++) {
    var rule = rules3[i];
    if (filterValue(rule, node, options)) return rule;
  }
  return void 0;
}
function filterValue(rule, node, options) {
  var filter = rule.filter;
  if (typeof filter === "string") {
    if (filter === node.nodeName.toLowerCase()) return true;
  } else if (Array.isArray(filter)) {
    if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true;
  } else if (typeof filter === "function") {
    if (filter.call(rule, node, options)) return true;
  } else {
    throw new TypeError("`filter` needs to be a string, array, or function");
  }
}
function collapseWhitespace(options) {
  var element = options.element;
  var isBlock2 = options.isBlock;
  var isVoid2 = options.isVoid;
  var isPre = options.isPre || function(node2) {
    return node2.nodeName === "PRE";
  };
  if (!element.firstChild || isPre(element)) return;
  var prevText = null;
  var keepLeadingWs = false;
  var prev = null;
  var node = next(prev, element, isPre);
  while (node !== element) {
    if (node.nodeType === 3 || node.nodeType === 4) {
      var text = node.data.replace(/[ \r\n\t]+/g, " ");
      if ((!prevText || / $/.test(prevText.data)) && !keepLeadingWs && text[0] === " ") {
        text = text.substr(1);
      }
      if (!text) {
        node = remove(node);
        continue;
      }
      node.data = text;
      prevText = node;
    } else if (node.nodeType === 1) {
      if (isBlock2(node) || node.nodeName === "BR") {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, "");
        }
        prevText = null;
        keepLeadingWs = false;
      } else if (isVoid2(node) || isPre(node)) {
        prevText = null;
        keepLeadingWs = true;
      } else if (prevText) {
        keepLeadingWs = false;
      }
    } else {
      node = remove(node);
      continue;
    }
    var nextNode = next(prev, node, isPre);
    prev = node;
    node = nextNode;
  }
  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, "");
    if (!prevText.data) {
      remove(prevText);
    }
  }
}
function remove(node) {
  var next2 = node.nextSibling || node.parentNode;
  node.parentNode.removeChild(node);
  return next2;
}
function next(prev, current, isPre) {
  if (prev && prev.parentNode === current || isPre(current)) {
    return current.nextSibling || current.parentNode;
  }
  return current.firstChild || current.nextSibling || current.parentNode;
}
var root = typeof window !== "undefined" ? window : {};
function canParseHTMLNatively() {
  var Parser = root.DOMParser;
  var canParse = false;
  try {
    if (new Parser().parseFromString("", "text/html")) {
      canParse = true;
    }
  } catch (e) {
  }
  return canParse;
}
function createHTMLParser() {
  var Parser = function() {
  };
  {
    if (shouldUseActiveX()) {
      Parser.prototype.parseFromString = function(string) {
        var doc = new window.ActiveXObject("htmlfile");
        doc.designMode = "on";
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    } else {
      Parser.prototype.parseFromString = function(string) {
        var doc = document.implementation.createHTMLDocument("");
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    }
  }
  return Parser;
}
function shouldUseActiveX() {
  var useActiveX = false;
  try {
    document.implementation.createHTMLDocument("").open();
  } catch (e) {
    if (root.ActiveXObject) useActiveX = true;
  }
  return useActiveX;
}
var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();
function RootNode(input, options) {
  var root2;
  if (typeof input === "string") {
    var doc = htmlParser().parseFromString(
      // DOM parsers arrange elements in the <head> and <body>.
      // Wrapping in a custom element ensures elements are reliably arranged in
      // a single element.
      '<x-turndown id="turndown-root">' + input + "</x-turndown>",
      "text/html"
    );
    root2 = doc.getElementById("turndown-root");
  } else {
    root2 = input.cloneNode(true);
  }
  collapseWhitespace({
    element: root2,
    isBlock,
    isVoid,
    isPre: options.preformattedCode ? isPreOrCode : null
  });
  return root2;
}
var _htmlParser;
function htmlParser() {
  _htmlParser = _htmlParser || new HTMLParser();
  return _htmlParser;
}
function isPreOrCode(node) {
  return node.nodeName === "PRE" || node.nodeName === "CODE";
}
function Node(node, options) {
  node.isBlock = isBlock(node);
  node.isCode = node.nodeName === "CODE" || node.parentNode.isCode;
  node.isBlank = isBlank(node);
  node.flankingWhitespace = flankingWhitespace(node, options);
  return node;
}
function isBlank(node) {
  return !isVoid(node) && !isMeaningfulWhenBlank(node) && /^\s*$/i.test(node.textContent) && !hasVoid(node) && !hasMeaningfulWhenBlank(node);
}
function flankingWhitespace(node, options) {
  if (node.isBlock || options.preformattedCode && node.isCode) {
    return {
      leading: "",
      trailing: ""
    };
  }
  var edges = edgeWhitespace(node.textContent);
  if (edges.leadingAscii && isFlankedByWhitespace("left", node, options)) {
    edges.leading = edges.leadingNonAscii;
  }
  if (edges.trailingAscii && isFlankedByWhitespace("right", node, options)) {
    edges.trailing = edges.trailingNonAscii;
  }
  return {
    leading: edges.leading,
    trailing: edges.trailing
  };
}
function edgeWhitespace(string) {
  var m = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);
  return {
    leading: m[1],
    // whole string for whitespace-only strings
    leadingAscii: m[2],
    leadingNonAscii: m[3],
    trailing: m[4],
    // empty for whitespace-only strings
    trailingNonAscii: m[5],
    trailingAscii: m[6]
  };
}
function isFlankedByWhitespace(side, node, options) {
  var sibling;
  var regExp;
  var isFlanked;
  if (side === "left") {
    sibling = node.previousSibling;
    regExp = / $/;
  } else {
    sibling = node.nextSibling;
    regExp = /^ /;
  }
  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue);
    } else if (options.preformattedCode && sibling.nodeName === "CODE") {
      isFlanked = false;
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent);
    }
  }
  return isFlanked;
}
var reduce = Array.prototype.reduce;
function TurndownService(options) {
  if (!(this instanceof TurndownService)) return new TurndownService(options);
  var defaults = {
    rules,
    headingStyle: "setext",
    hr: "* * *",
    bulletListMarker: "*",
    codeBlockStyle: "indented",
    fence: "```",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
    br: "  ",
    preformattedCode: false,
    blankReplacement: function(content, node) {
      return node.isBlock ? "\n\n" : "";
    },
    keepReplacement: function(content, node) {
      return node.isBlock ? "\n\n" + node.outerHTML + "\n\n" : node.outerHTML;
    },
    defaultReplacement: function(content, node) {
      return node.isBlock ? "\n\n" + content + "\n\n" : content;
    }
  };
  this.options = extend({}, defaults, options);
  this.rules = new Rules(this.options);
}
TurndownService.prototype = {
  /**
   * The entry point for converting a string or DOM node to Markdown
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */
  turndown: function(input) {
    if (!canConvert(input)) {
      throw new TypeError(input + " is not a string, or an element/document/fragment node.");
    }
    if (input === "") return "";
    var output = process.call(this, new RootNode(input, this.options));
    return postProcess.call(this, output);
  },
  /**
   * Add one or more plugins
   * @public
   * @param {Function|Array} plugin The plugin or array of plugins to add
   * @returns The Turndown instance for chaining
   * @type Object
   */
  use: function(plugin) {
    if (Array.isArray(plugin)) {
      for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
    } else if (typeof plugin === "function") {
      plugin(this);
    } else {
      throw new TypeError("plugin must be a Function or an Array of Functions");
    }
    return this;
  },
  /**
   * Adds a rule
   * @public
   * @param {String} key The unique key of the rule
   * @param {Object} rule The rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  addRule: function(key, rule) {
    this.rules.add(key, rule);
    return this;
  },
  /**
   * Keep a node (as HTML) that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  keep: function(filter) {
    this.rules.keep(filter);
    return this;
  },
  /**
   * Remove a node that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  remove: function(filter) {
    this.rules.remove(filter);
    return this;
  },
  /**
   * Escapes Markdown syntax
   * @public
   * @param {String} string The string to escape
   * @returns A string with Markdown syntax escaped
   * @type String
   */
  escape: function(string) {
    return escapeMarkdown(string);
  }
};
function process(parentNode) {
  var self = this;
  return reduce.call(parentNode.childNodes, function(output, node) {
    node = new Node(node, self.options);
    var replacement = "";
    if (node.nodeType === 3) {
      replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
    } else if (node.nodeType === 1) {
      replacement = replacementForNode.call(self, node);
    }
    return join(output, replacement);
  }, "");
}
function postProcess(output) {
  var self = this;
  this.rules.forEach(function(rule) {
    if (typeof rule.append === "function") {
      output = join(output, rule.append(self.options));
    }
  });
  return output.replace(/^[\t\r\n]+/, "").replace(/[\t\r\n\s]+$/, "");
}
function replacementForNode(node) {
  var rule = this.rules.forNode(node);
  var content = process.call(this, node);
  var whitespace = node.flankingWhitespace;
  if (whitespace.leading || whitespace.trailing) content = content.trim();
  return whitespace.leading + rule.replacement(content, node, this.options) + whitespace.trailing;
}
function join(output, replacement) {
  var s1 = trimTrailingNewlines(output);
  var s2 = trimLeadingNewlines(replacement);
  var nls = Math.max(output.length - s1.length, replacement.length - s2.length);
  var separator = "\n\n".substring(0, nls);
  return s1 + separator + s2;
}
function canConvert(input) {
  return input != null && (typeof input === "string" || input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11));
}

// node_modules/.pnpm/turndown-plugin-gfm@1.0.2/node_modules/turndown-plugin-gfm/lib/turndown-plugin-gfm.es.js
var highlightRegExp = /highlight-(?:text|source)-([a-z0-9]+)/;
function highlightedCodeBlock(turndownService) {
  turndownService.addRule("highlightedCodeBlock", {
    filter: function(node) {
      var firstChild = node.firstChild;
      return node.nodeName === "DIV" && highlightRegExp.test(node.className) && firstChild && firstChild.nodeName === "PRE";
    },
    replacement: function(content, node, options) {
      var className = node.className || "";
      var language = (className.match(highlightRegExp) || [null, ""])[1];
      return "\n\n" + options.fence + language + "\n" + node.firstChild.textContent + "\n" + options.fence + "\n\n";
    }
  });
}
function strikethrough(turndownService) {
  turndownService.addRule("strikethrough", {
    filter: ["del", "s", "strike"],
    replacement: function(content) {
      return "~" + content + "~";
    }
  });
}
var indexOf = Array.prototype.indexOf;
var every = Array.prototype.every;
var rules2 = {};
rules2.tableCell = {
  filter: ["th", "td"],
  replacement: function(content, node) {
    return cell(content, node);
  }
};
rules2.tableRow = {
  filter: "tr",
  replacement: function(content, node) {
    var borderCells = "";
    var alignMap = { left: ":--", right: "--:", center: ":-:" };
    if (isHeadingRow(node)) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var border = "---";
        var align = (node.childNodes[i].getAttribute("align") || "").toLowerCase();
        if (align) border = alignMap[align] || border;
        borderCells += cell(border, node.childNodes[i]);
      }
    }
    return "\n" + content + (borderCells ? "\n" + borderCells : "");
  }
};
rules2.table = {
  // Only convert tables with a heading row.
  // Tables with no heading row are kept using `keep` (see below).
  filter: function(node) {
    return node.nodeName === "TABLE" && isHeadingRow(node.rows[0]);
  },
  replacement: function(content) {
    content = content.replace("\n\n", "\n");
    return "\n\n" + content + "\n\n";
  }
};
rules2.tableSection = {
  filter: ["thead", "tbody", "tfoot"],
  replacement: function(content) {
    return content;
  }
};
function isHeadingRow(tr) {
  var parentNode = tr.parentNode;
  return parentNode.nodeName === "THEAD" || parentNode.firstChild === tr && (parentNode.nodeName === "TABLE" || isFirstTbody(parentNode)) && every.call(tr.childNodes, function(n) {
    return n.nodeName === "TH";
  });
}
function isFirstTbody(element) {
  var previousSibling = element.previousSibling;
  return element.nodeName === "TBODY" && (!previousSibling || previousSibling.nodeName === "THEAD" && /^\s*$/i.test(previousSibling.textContent));
}
function cell(content, node) {
  var index = indexOf.call(node.parentNode.childNodes, node);
  var prefix = " ";
  if (index === 0) prefix = "| ";
  return prefix + content + " |";
}
function tables(turndownService) {
  turndownService.keep(function(node) {
    return node.nodeName === "TABLE" && !isHeadingRow(node.rows[0]);
  });
  for (var key in rules2) turndownService.addRule(key, rules2[key]);
}
function taskListItems(turndownService) {
  turndownService.addRule("taskListItems", {
    filter: function(node) {
      return node.type === "checkbox" && node.parentNode.nodeName === "LI";
    },
    replacement: function(content, node) {
      return (node.checked ? "[x]" : "[ ]") + " ";
    }
  });
}
function gfm(turndownService) {
  turndownService.use([
    highlightedCodeBlock,
    strikethrough,
    tables,
    taskListItems
  ]);
}

// HTML to Markdown conversion.
async function convertHtmlToMarkdown(options) {
  const doc = new DOMParser().parseFromString(`<div id="baidu-ai-root">${options.html}</div>`, "text/html");
  const root2 = doc.querySelector("#baidu-ai-root");
  if (!root2) throw new Error("HTML \u89E3\u6790\u5931\u8D25");
  simplifyQuillTables(root2, doc);
  if (options.downloadImages) {
    await localizeImages(root2, options);
  }
  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**"
  });
  turndown.use(gfm);
  turndown.keep(["u", "mark"]);
  turndown.addRule("quillBold", {
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const weight = node.style.fontWeight;
      return Array.from(node.classList).some((name) => name.startsWith("ql-bold")) || weight === "bold" || Number(weight) >= 600;
    },
    replacement: (content) => content.trim() ? `**${content.trim()}**` : ""
  });
  turndown.addRule("quillListItem", {
    filter: "li",
    replacement: (content, node) => {
      var _a;
      const item = node;
      const indentMatch = item.className.match(/(?:^|\s)ql-indent-(\d+)(?:\s|$)/);
      const level = indentMatch ? Number(indentMatch[1]) : 0;
      const indent = "  ".repeat(Math.max(0, level));
      const listType = item.getAttribute("data-list");
      const ordered = listType === "ordered" || !listType && ((_a = item.parentElement) == null ? void 0 : _a.nodeName) === "OL";
      const marker = ordered ? "1. " : "- ";
      const cleaned = content.replace(/^\s+|\s+$/g, "").replace(/\n/g, `
${indent}   `);
      if (/^!\[\[[^\n]+\]\]$/.test(cleaned) || /^!\[[^\n]*\]\([^\n]+\)$/.test(cleaned)) {
        return `

${cleaned}

`;
      }
      return `
${indent}${marker}${cleaned}
`;
    }
  });
  turndown.addRule("baiduTimestamp", {
    filter: (node) => node instanceof HTMLElement && node.hasAttribute("data-baidu-ai-time"),
    replacement: (_content, node) => {
      var _a;
      const element = node;
      const seconds = Number(element.getAttribute("data-baidu-ai-time"));
      const label = element.getAttribute("data-baidu-ai-label") || ((_a = element.textContent) == null ? void 0 : _a.trim()) || formatTime(seconds);
      if (!Number.isFinite(seconds)) return label;
      if (options.videoUrl) {
        const baseUrl = options.videoUrl.split("#")[0];
        return `[${escapeMarkdownLabel(label)}](${baseUrl}#t=${formatTime(seconds)})`;
      }
      return `<span class="baidu-ai-timestamp" data-time="${seconds}">${escapeHtml(label)}</span>`;
    }
  });
  turndown.addRule("localizedImage", {
    filter: (node) => node.nodeName === "IMG" && Boolean(node.dataset.obsidianPath),
    replacement: (_content, node) => {
      var _a, _b;
      const image = node;
      const path = (_a = image.dataset.obsidianPath) != null ? _a : "";
      const alt = (_b = image.getAttribute("alt")) == null ? void 0 : _b.trim();
      return `![[${path}${alt ? `|${alt}` : ""}]]`;
    }
  });
  return polishMarkdown(turndown.turndown(root2.innerHTML));
}
function simplifyQuillTables(root2, doc) {
  root2.querySelectorAll("table").forEach((sourceTable) => {
    const rows = Array.from(sourceTable.querySelectorAll("tr"));
    if (rows.length === 0) return;
    const table = doc.createElement("table");
    rows.forEach((sourceRow, rowIndex) => {
      const row = doc.createElement("tr");
      Array.from(sourceRow.children).filter((cell2) => cell2.tagName === "TD" || cell2.tagName === "TH").forEach((sourceCell) => {
        var _a;
        const cell2 = doc.createElement(rowIndex === 0 ? "th" : "td");
        cell2.textContent = ((_a = sourceCell.textContent) != null ? _a : "").replace(/\s+/g, " ").trim();
        row.appendChild(cell2);
      });
      if (row.children.length > 0) table.appendChild(row);
    });
    if (table.children.length > 0) sourceTable.replaceWith(table);
  });
}
function polishMarkdown(markdown) {
  let result = markdown.replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "").replace(/^以下为AI生成的图文笔记的内容\s*$/m, "").replace(/^(#{4,6})(\s+)/gm, (_match, hashes, space) => `${"#".repeat(hashes.length - 2)}${space}`).replace(/^(#{2,4}\s+[^\n]+)\n\n(<span class="baidu-ai-timestamp"[^>]*>[^<]+<\/span>)/gm, "$1 $2").replace(/^(#{2,4}\s+[^\n]+)\n\n(\[[^\]\n]+\]\(https:\/\/pan\.baidu\.com\/(?:pfile\/video|fcb\/edit)[^\n]*#t=[^)]+\))/gm, "$1 $2").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  return result;
}
async function localizeImages(root2, options) {
  const images = Array.from(root2.querySelectorAll("img[src]"));
  if (images.length === 0) return;
  const folder = cleanVaultPath(options.attachmentsFolder || "Netdisk AI Notes Importer/attachments");
  await ensureFolder(options.vault, folder);
  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const src = image.getAttribute("src");
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) continue;
    try {
      const response = await (0, import_obsidian.requestUrl)({ url: src, method: "GET" });
      const extension = inferExtension(src, response.headers["content-type"]);
      const base = `${sanitizeFileName(options.noteTitle)}-${shortHash(src)}.${extension}`;
      const path = (0, import_obsidian.normalizePath)(`${folder}/${base}`);
      if (!options.vault.getAbstractFileByPath(path)) {
        await options.vault.createBinary(path, response.arrayBuffer);
      }
      image.dataset.obsidianPath = path;
    } catch (error) {
      console.warn("Netdisk AI Notes Importer: image download failed", src, error);
    }
  }
}
async function ensureFolder(vault, folder) {
  if (!folder) return;
  const parts = (0, import_obsidian.normalizePath)(folder).split("/");
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!vault.getAbstractFileByPath(current)) await vault.createFolder(current);
  }
}
function inferExtension(url, contentType) {
  const byType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/avif": "avif"
  };
  const mime = contentType == null ? void 0 : contentType.split(";")[0].toLowerCase();
  if (mime && byType[mime]) return byType[mime];
  try {
    const match = new URL(url).pathname.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (match && /^(jpe?g|png|gif|webp|svg|avif)$/i.test(match[1])) return match[1].toLowerCase().replace("jpeg", "jpg");
  } catch (e) {
  }
  return "jpg";
}
function sanitizeFileName(value) {
  return value.replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ").trim().slice(0, 120) || "\u767E\u5EA6 AI \u7B14\u8BB0";
}
function cleanVaultPath(value) {
  return (0, import_obsidian.normalizePath)(value.trim().replace(/^[/\\]+|[/\\]+$/g, ""));
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const secs = total % 60;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeMarkdownLabel(value) {
  return value.replace(/([\\\[\]])/g, "\\$1");
}
function shortHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// Editor timestamp interactions.
var import_view = require("@codemirror/view");
var TIMESTAMP_PATTERN = /<span\s+class="baidu-ai-timestamp"\s+data-time="(\d+(?:\.\d+)?)">([^<]+)<\/span>/g;
var NetdiskTimestampWidget = class extends import_view.WidgetType {
  constructor(seconds, label, onSeek) {
    super();
    this.seconds = seconds;
    this.label = label;
    this.onSeek = onSeek;
  }
  eq(other) {
    return this.seconds === other.seconds && this.label === other.label;
  }
  toDOM() {
    const element = document.createElement("span");
    element.className = "baidu-ai-timestamp baidu-ai-timestamp-editor";
    element.dataset.time = String(this.seconds);
    element.textContent = this.label;
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", `\u8DF3\u8F6C\u5230\u89C6\u9891 ${this.label}`);
    const activate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.onSeek(this.seconds);
    };
    element.addEventListener("pointerdown", (event) => {
      if (event.button === 0) activate(event);
    });
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") activate(event);
    });
    return element;
  }
  ignoreEvent(event) {
    return event.type === "click" || event.type === "keydown" || event.type.startsWith("pointer") || event.type.startsWith("mouse");
  }
};
function buildDecorations(view, onSeek) {
  const source = view.state.doc.toString();
  const ranges = [];
  TIMESTAMP_PATTERN.lastIndex = 0;
  let match;
  while ((match = TIMESTAMP_PATTERN.exec(source)) !== null) {
    const seconds = Number(match[1]);
    if (!Number.isFinite(seconds)) continue;
    const widget = new NetdiskTimestampWidget(seconds, decodeEntities(match[2]), onSeek);
    ranges.push(import_view.Decoration.replace({ widget }).range(match.index, match.index + match[0].length));
  }
  return import_view.Decoration.set(ranges, true);
}
function createTimestampEditorExtension(onSeek) {
  const legacyWidgets = import_view.ViewPlugin.fromClass(class {
    constructor(view) {
      this.decorations = buildDecorations(view, onSeek);
    }
    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view, onSeek);
      }
    }
  }, {
    decorations: (plugin) => plugin.decorations
  });
  const markdownLinkClicks = import_view.EditorView.domEventHandlers({
    pointerdown(event) {
      if (event.button !== 0) return false;
      const target = event.target;
      if (!(target instanceof Element)) return false;
      const link = target.closest('a[href*="pan.baidu.com/"][href*="#t="]');
      if (!link) return false;
      const seconds = secondsFromHref(link.href);
      if (seconds === null) return false;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      onSeek(seconds);
      return true;
    }
  });
  return [legacyWidgets, markdownLinkClicks];
}
function decodeEntities(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}
function secondsFromHref(value) {
  try {
    const url = new URL(value);
    if (!isPlaybackUrl(value)) return null;
    const raw = new URLSearchParams(url.hash.slice(1)).get("t");
    if (!raw) return null;
    const parts = raw.split(":").map(Number);
    if (parts.some((part) => !Number.isFinite(part))) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts.length === 1 ? parts[0] : null;
  } catch (e) {
    return null;
  }
}

// A destination belongs to one import operation, never to shared mutable settings.
var folderObsidian = require("obsidian");
function validateNotesFolder(app, value) {
  const raw = value.trim().replace(/\\/g, "/");
  if (raw.startsWith("/") || /[:*?"<>|\x00-\x1f]/.test(raw)) throw new Error("请输入 Vault 内的相对文件夹路径");
  const parts = raw.split("/").filter(Boolean);
  if (parts.some(part => part === "." || part === ".." || part.startsWith(".") || /[. ]$/.test(part))) throw new Error("文件夹名称不能以点开头、以点或空格结尾，也不能包含 ..");
  let path = "";
  for (const part of parts) {
    path = path ? `${path}/${part}` : part;
    const existing = app.vault.getAbstractFileByPath(path);
    if (existing && !(existing instanceof folderObsidian.TFolder)) throw new Error(`路径已被文件占用：${path}`);
  }
  return parts.join("/");
}
var NotesFolderPicker = class extends folderObsidian.SuggestModal {
  constructor(app, initial, resolve) {
    super(app);
    this.initial = initial;
    this.resolve = resolve;
    this.setPlaceholder("搜索已有文件夹，或输入新路径（留空可选根目录）");
  }
  onOpen() {
    super.onOpen();
    this.inputEl.value = this.initial;
    this.inputEl.dispatchEvent(new Event("input"));
    this.inputEl.select();
  }
  getSuggestions(query) {
    const folders = this.app.vault.getAllLoadedFiles().filter(file => file instanceof folderObsidian.TFolder && file.path !== "/").map(file => file.path);
    const matches = ["", ...folders.sort((a, b) => a.localeCompare(b))].filter(path => path.toLowerCase().includes(query.trim().toLowerCase())).map(path => ({ path, create: false }));
    try {
      const path = validateNotesFolder(this.app, query);
      if (path && !folders.includes(path)) matches.unshift({ path, create: true });
    } catch (error) {
      matches.unshift({ error: error.message });
    }
    return matches;
  }
  renderSuggestion(item, el) {
    el.setText(item.error || (item.create ? `新建文件夹：${item.path}` : item.path || "Vault 根目录"));
  }
  selectSuggestion(item, event) {
    // Invalid input must leave the picker open so the user can correct it.
    try {
      if (item.error) throw new Error(item.error);
      validateNotesFolder(this.app, item.path);
    } catch (error) {
      new folderObsidian.Notice(error.message);
      return;
    }
    this.selectedPath = item.path;
    super.selectSuggestion(item, event);
  }
  onChooseSuggestion(item) { this.finish(item.path); }
  finish(value) {
    if (this.resolve) {
      const resolve = this.resolve;
      this.resolve = null;
      resolve(value);
    }
  }
  onClose() {
    super.onClose();
    this.finish(this.selectedPath === undefined ? null : this.selectedPath);
  }
};
function chooseNotesFolder(app, initial) {
  return new Promise(resolve => new NotesFolderPicker(app, initial, resolve).open());
}

function noteAttachmentsFolder(folder) {
  return folder ? `${folder}/attachments` : "attachments";
}

// Settings UI.
var import_obsidian2 = require("obsidian");
var NetdiskAiNotesSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("首次使用").setDesc("打开网盘、进入 AI 笔记并导入。").addButton(b => b.setButtonText("开始导入").onClick(() => this.plugin.showImportGuide()));
    new import_obsidian2.Setting(containerEl).setName("保存位置").setHeading();
    new import_obsidian2.Setting(containerEl).setName("导入前询问保存文件夹").setDesc("开启：每次导入选择文件夹，批量导入只选一次。关闭：始终使用固定文件夹。").addToggle(toggle => toggle.setValue(this.plugin.settings.askNotesFolder).onChange(async value => {
      this.plugin.settings.askNotesFolder = value;
      await this.plugin.saveSettings();
      this.display();
    }));
    if (!this.plugin.settings.askNotesFolder) {
      new import_obsidian2.Setting(containerEl).setName("固定保存文件夹").setDesc(this.plugin.settings.notesFolder || "Vault 根目录").addButton(button => button.setButtonText("选择或新建文件夹").onClick(async () => {
        const folder = await chooseNotesFolder(this.app, this.plugin.settings.notesFolder);
        if (folder === null) return;
        this.plugin.settings.notesFolder = folder;
        await this.plugin.saveSettings();
        this.display();
      }));
    }
    new import_obsidian2.Setting(containerEl).setName("图片随笔记保存").setDesc("下载的图片自动保存到笔记所在文件夹的 attachments 子目录，无需单独设置。同步时使用笔记当前所在文件夹，已有图片和链接保持原样。");
    new import_obsidian2.Setting(containerEl).setName("\u81EA\u52A8\u4E0B\u8F7D\u56FE\u7247").setDesc("\u5173\u95ED\u65F6\u4FDD\u7559\u767E\u5EA6 CDN \u56FE\u7247\u5730\u5740\u3002").addToggle((toggle) => toggle.setValue(this.plugin.settings.downloadImages).onChange(async (value) => {
      this.plugin.settings.downloadImages = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("\u540C\u6B65\u7B56\u7565").setDesc("\u589E\u91CF\u540C\u6B65\u4FDD\u7559\u5DF2\u6709\u7AE0\u8282\u53CA\u5176\u4E2D\u7684\u4FEE\u6539\uFF0C\u53EA\u8865\u5145\u8FDC\u7AEF\u65B0\u589E\u7684\u6807\u9898\u7AE0\u8282\u3002\u8986\u76D6\u6A21\u5F0F\u4F1A\u66FF\u6362\u63D2\u4EF6\u7BA1\u7406\u533A\u57DF\u3002").addDropdown((dropdown) => dropdown.addOption("incremental", "\u589E\u91CF\u540C\u6B65\uFF08\u63A8\u8350\uFF09").addOption("replace", "\u8986\u76D6\u63D2\u4EF6\u7BA1\u7406\u533A\u57DF").setValue(this.plugin.settings.syncMode).onChange(async (value) => {
      this.plugin.settings.syncMode = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("\u5927\u89C6\u9891\u6253\u5F00\u4F4D\u7F6E").setDesc("Web Viewer \u4F7F\u7528\u7684\u4F4D\u7F6E\u3002").addDropdown((dropdown) => dropdown.addOption("current", "\u5F53\u524D\u9875").addOption("right", "\u53F3\u4FA7\u5206\u680F").setValue(this.plugin.settings.videoOpenPosition).onChange(async (value) => {
      this.plugin.settings.videoOpenPosition = value;
      await this.plugin.saveSettings();
    }));
  }
};

// Default settings.
var DEFAULT_SETTINGS = {
  askNotesFolder: true,
  notesFolder: "Netdisk AI Notes Importer",
  attachmentsFolder: "Netdisk AI Notes Importer/attachments",
  videoOpenPosition: "right",
  downloadImages: true,
  syncMode: "incremental",
  videoByFcbUrl: {}
};

// Baidu Netdisk Web Viewer integration.
var import_obsidian3 = require("obsidian");
var FCB_URL_PART = "pan.baidu.com/fcb/edit";
var VIDEO_URL_PART = "pan.baidu.com/pfile/video";
function getWebviews() {
  return Array.from(document.querySelectorAll("webview"));
}
function safeWebviewUrl(webview) {
  try {
    return webview.getURL() || "";
  } catch (e) {
    return "";
  }
}
function findFcbWebview(url, app) {
  const candidates = getWebviews().filter((view) => safeWebviewUrl(view).includes(FCB_URL_PART));
  if (!url) {
    const container = app?.workspace?.activeLeaf?.view?.containerEl;
    const active = candidates.find(view => container?.contains(view));
    if (active) return active;
    if (candidates.length > 1) throw new Error("打开了多篇 AI 笔记，请先选中要导入的网页标签，再执行导入命令。");
    return candidates[0];
  }
  return candidates.find((view) => samePage(safeWebviewUrl(view), url));
}
function findVideoWebview(videoUrl) {
  return findVideoWebviews(videoUrl)[0];
}
function findVideoWebviews(videoUrl) {
  if (isEmbeddedVideoUrl(videoUrl)) {
    return getWebviews().filter(view => isEmbeddedVideoUrl(safeWebviewUrl(view)) && sameUrl(safeWebviewUrl(view), videoUrl));
  }
  const candidates = getWebviews().filter((view) => isVideoUrl(safeWebviewUrl(view)));
  if (!videoUrl) return candidates;
  const exact = candidates.filter((view) => samePage(safeWebviewUrl(view), videoUrl));
  if (exact.length > 0) return exact;
  const wantedPath = getQueryPath(videoUrl);
  return wantedPath ? candidates.filter((view) => getQueryPath(safeWebviewUrl(view)) === wantedPath) : [];
}
function normalizedUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  } catch (e) {
    return value;
  }
}
function samePage(left, right) {
  return normalizedUrl(left) === normalizedUrl(right);
}
function getQueryPath(value) {
  try {
    return new URL(value).searchParams.get("path");
  } catch (e) {
    return null;
  }
}
async function executeWithRetry(webview, code, attempts = 4, delayMs = 350) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await webview.executeJavaScript(code, true);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(delayMs * attempt);
    }
  }
  throw new Error(`Web Viewer \u811A\u672C\u6267\u884C\u5931\u8D25\uFF08\u5DF2\u91CD\u8BD5 ${attempts} \u6B21\uFF09\uFF1A${errorMessage(lastError)}`);
}
async function extractFcbSnapshot(webview) {
  const code = String.raw`(() => {
    const editor = document.querySelector('.ql-editor');
    if (!editor) throw new Error('找不到 .ql-editor，页面可能尚未加载完成');
    const clone = editor.cloneNode(true);
    clone.querySelectorAll('.ql-timestamp-content').forEach((node) => {
      const text = (node.textContent || '').trim();
      const parts = text.split(':').map(Number);
      let seconds = NaN;
      if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
      if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (Number.isFinite(seconds)) {
        node.setAttribute('data-baidu-ai-time', String(seconds));
        node.setAttribute('data-baidu-ai-label', text);
      }
    });

    const pathTitle = (() => {
      try {
        const path = new URL(location.href).searchParams.get('path') || '';
        return (path.split('/').filter(Boolean).pop() || '').replace(/\.fcb$/i, '');
      } catch (_) { return ''; }
    })();
    const titleSelectors = [
      'input[placeholder*="标题"]', '[class*="title"] input',
      '[class*="title"][contenteditable="true"]', '.document-title', 'h1'
    ];
    let title = pathTitle.trim();
    if (!title) {
      for (const selector of titleSelectors) {
        const el = document.querySelector(selector);
        const value = el && ('value' in el ? el.value : el.textContent);
        if (value && String(value).trim()) { title = String(value).trim(); break; }
      }
    }
    if (!title) title = document.title.replace(/[-_|].*百度网盘.*$/i, '').trim() || '百度 AI 笔记';

    const hasEmbeddedVideo = Array.from(document.querySelectorAll('video'))
      .some(video => Number.isFinite(video.duration) && video.duration > 0 && video.readyState >= 1);
    return { url: location.href, title, html: clone.innerHTML, videoUrlCandidates: [], hasEmbeddedVideo };
  })()`;
  return executeWithRetry(webview, code);
}
async function seekWebview(webview, seconds) {
  const code = `(() => {
    const v = Array.from(document.querySelectorAll("video"))
      .find(v => Number.isFinite(v.duration) && v.duration > 0 && v.readyState >= 1);
    if (!v) return false;
    if (${JSON.stringify(isEmbeddedVideoUrl(safeWebviewUrl(webview)))}) v.pause();
    v.currentTime = ${JSON.stringify(seconds)};
    // Chromium may apply the seek asynchronously; successful assignment is enough.
    return true;
  })()`;
  try {
    return await executeWithRetry(webview, code, 2, 250);
  } catch (e) {
    return false;
  }
}
async function waitForWebview(predicate, timeoutMs = 2e4, intervalMs = 400) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = getWebviews().find(predicate);
    if (match) return match;
    await delay(intervalMs);
  }
  throw new Error("\u7B49\u5F85 Web Viewer \u52A0\u8F7D\u8D85\u65F6");
}
async function waitAndSeek(videoUrl, seconds) {
  const deadline = Date.now() + 25e3;
  let foundAny = false;
  while (Date.now() < deadline) {
    const views = findVideoWebviews(videoUrl);
    foundAny || (foundAny = views.length > 0);
    for (const view of views) {
      if (await seekWebview(view, seconds)) return view;
    }
    await delay(500);
  }
  throw new Error(foundAny ? "\u89C6\u9891\u64AD\u653E\u5668\u5728\u8D85\u65F6\u524D\u672A\u51C6\u5907\u597D" : "\u672A\u627E\u5230\u5BF9\u5E94\u7684\u5927\u89C6\u9891 Web Viewer");
}
// The import entry belongs in the main workspace, never in a sidebar.
// Reuse an existing page without reloading it or resetting its navigation.
function focusImportWorkspace(app) {
  // Settings can live in a separate window. Leaving it open would hide the
  // activated main tab, and a guide created there would inherit that window.
  if (app.setting?.modalEl?.isConnected) app.setting.close();
  app.workspace.containerEl?.ownerDocument?.defaultView?.focus();
}
async function openNetdiskEntry(app) {
  focusImportWorkspace(app);
  const workspace = app.workspace;
  const leaves = [];
  workspace.iterateAllLeaves(leaf => { leaves.push(leaf); });
  const isMain = leaf => leaf.getRoot() === workspace.rootSplit;
  const isNetdisk = leaf => {
    const saved = leaf.getViewState();
    if (leaf.view.getViewType() !== "webviewer" && saved.type !== "webviewer") return false;
    const webview = leaf.view.containerEl?.querySelector("webview");
    const liveUrl = webview && safeWebviewUrl(webview);
    // A restored tab can still be deferred or showing about:blank. Its saved
    // destination is enough to select it without creating a duplicate tab.
    const url = liveUrl && liveUrl !== "about:blank" ? liveUrl : saved.state?.url;
    try { const parsed = new URL(url); return parsed.protocol === "https:" && parsed.hostname === "pan.baidu.com"; } catch (_) { return false; }
  };
  const active = workspace.activeLeaf;
  const pages = leaves.filter(isNetdisk);
  const existing = pages.find(leaf => leaf === active && isMain(leaf)) || pages.find(isMain) || pages[0];
  if (existing && isMain(existing)) {
    await workspace.revealLeaf(existing);
    workspace.setActiveLeaf(existing, {focus: true});
    workspace.rightSplit?.collapse();
    return existing;
  }
  const empty = leaf => isMain(leaf) && leaf.view.getViewType() === "empty";
  const target = leaves.find(leaf => leaf === active && empty(leaf)) || leaves.find(empty) || workspace.getLeaf("tab");
  if (!isMain(target)) throw new Error("无法在中央打开网盘，请先选中中间的标签页后重试。");
  const state = existing ? existing.getViewState() : {type: "webviewer", state: {url: "https://pan.baidu.com"}};
  await target.setViewState({...state, active: true});
  await workspace.revealLeaf(target);
  workspace.setActiveLeaf(target, {focus: true});
  // Close only the relocated sidebar page, after the central page is ready.
  if (existing) existing.detach();
  workspace.rightSplit?.collapse();
  return target;
}
async function openInWebViewer(app, url, position) {
  var _a;
  const leaf = position === "tab" ? app.workspace.getLeaf("tab") : position === "right" ? (_a = app.workspace.getRightLeaf(false)) != null ? _a : app.workspace.getLeaf("split", "vertical") : app.workspace.getLeaf(false);
  try {
    await leaf.setViewState({ type: "webviewer", active: true, state: { url } });
    app.workspace.revealLeaf(leaf);
    return leaf;
  } catch (error) {
    new import_obsidian3.Notice("\u65E0\u6CD5\u6253\u5F00 Obsidian Web Viewer\u3002\u8BF7\u786E\u8BA4\u6838\u5FC3\u63D2\u4EF6\u201C\u7F51\u9875\u6D4F\u89C8\u5668\u201D\u5DF2\u542F\u7528\u3002");
    throw error;
  }
}
function isVideoUrl(url) {
  try { const parsed = new URL(url); return parsed.protocol === "https:" && parsed.hostname === "pan.baidu.com" && parsed.pathname === "/pfile/video"; } catch (_) { return false; }
}
function isEmbeddedVideoUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "pan.baidu.com" && url.pathname === "/fcb/edit" && Boolean(url.searchParams.get("path") || url.searchParams.get("fsid"));
  } catch (_) { return false; }
}
function isPlaybackUrl(value) { return isVideoUrl(value) || isEmbeddedVideoUrl(value); }
function snapshotPlaybackUrl(snapshot, fallback = "") {
  return snapshot.hasEmbeddedVideo && isEmbeddedVideoUrl(snapshot.url) ? snapshot.url : fallback;
}
function isFcbUrl(url) {
  return url.includes(FCB_URL_PART);
}
function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

// Obsidian-owned controls beside the current webview, never inside Baidu's DOM.
function netdiskPageKind(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "pan.baidu.com") return "other";
    return parsed.pathname === "/fcb/edit" ? "note" : "netdisk";
  } catch (_) { return "other"; }
}

var InlineImportBar = class {
  constructor(plugin, webview) {
    this.plugin = plugin;
    this.webview = webview;
    this.version = 0;
    this.retries = 0;
    this.busy = false;
    this.disposed = false;
    const leaf = plugin.findLeafForWebview(webview);
    const container = leaf?.view.containerEl;
    const content = container?.querySelector(".view-content");
    if (!content) return;
    this.el = container.createDiv({cls: "netdisk-inline-import"});
    container.insertBefore(this.el, content);
    const info = this.el.createDiv({cls: "netdisk-inline-info"});
    this.titleEl = info.createDiv({cls: "netdisk-inline-title", text: "网盘笔记导入"});
    this.statusEl = info.createDiv({cls: "netdisk-inline-status"});
    this.statusEl.setAttribute("role", "status");
    this.statusEl.setAttribute("aria-live", "polite");
    const actions = this.el.createDiv({cls: "netdisk-inline-actions"});
    this.primary = new import_obsidian4.ButtonComponent(actions).setButtonText("导入到 Obsidian").setCta().onClick(() => {
      if (this.result) void plugin.openFileReplacingWebview(null, this.result.file);
      else void this.importNote();
    });
    this.videoRetry = new import_obsidian4.ButtonComponent(actions).setButtonText("重新识别视频").onClick(() => void this.retryVideo());
    this.bind = new import_obsidian4.ButtonComponent(actions).setButtonText("手动补充").onClick(() => {
      const result = this.result;
      if (result) plugin.showVideoBinding(result.file, {reveal: false, onSaved: url => {
        if (this.result !== result || this.disposed) return;
        result.videoUrl = url;
        this.showResult();
      }});
    });
    this.retry = new import_obsidian4.ButtonComponent(actions).setButtonText("重新识别").onClick(() => {this.retries = 0; void this.refresh();});
    void this.refresh();
  }
  status(text) { if (!this.disposed) this.statusEl?.setText(text); }
  async refresh() {
    if (!this.el || this.disposed) return;
    clearTimeout(this.timer);
    const version = ++this.version;
    const url = safeWebviewUrl(this.webview);
    if (this.videoBusy && sameUrl(url, this.videoOperationUrl)) return;
    const kind = netdiskPageKind(url);
    this.el.hidden = kind === "other";
    if (kind === "other") return;
    this.url = url;
    this.ready = false;
    this.result = null;
    this.primary.setButtonText("导入到 Obsidian").setDisabled(true);
    this.bind.buttonEl.hidden = true;
    this.videoRetry.buttonEl.hidden = true;
    this.retry.buttonEl.hidden = true;
    this.titleEl.setText("网盘笔记导入");
    this.titleEl.removeAttribute("title");
    if (this.busy) {this.status("正在完成上一笔记的导入，请稍候…"); return;}
    if (kind !== "note") {this.status("打开 AI 笔记正文后，即可在这里导入。"); return;}
    this.status("正在识别当前笔记…");
    try {
      const snapshot = await extractFcbSnapshot(this.webview);
      if (this.disposed || this.version !== version) return;
      if (!snapshot.html.trim()) throw new Error("正文尚未加载");
      if (!sameUrl(snapshot.url, url)) {void this.refresh(); return;}
      this.titleEl.setText(snapshot.title);
      this.titleEl.setAttribute("title", snapshot.title);
      this.retries = 0;
      const file = this.plugin.findImportedFile(url);
      if (file) {
        const fm = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;
        let videoUrl = fm?.video_url || "";
        if (!videoUrl && snapshot.hasEmbeddedVideo) {
          try {videoUrl = await this.plugin.associateEmbeddedVideo(file, this.webview, snapshot);} catch (_) { /* Keep the manual fallback available. */ }
          if (this.disposed || this.version !== version) return;
        }
        this.result = {file, videoUrl, skipped: true};
        this.showResult();
      } else {
        this.ready = true;
        this.primary.setDisabled(false);
        this.status("已识别这篇笔记，可直接导入到 Obsidian。");
      }
    } catch (_) {
      if (this.disposed || this.version !== version) return;
      this.status("笔记正文尚未加载完成，正在等待；也可以点击重新识别。");
      this.retry.buttonEl.hidden = false;
      if (this.retries++ < 5) this.timer = setTimeout(() => void this.refresh(), 1500);
    }
  }
  showResult() {
    if (this.disposed) return;
    this.primary.setButtonText("查看本地笔记").setDisabled(false);
    const missing = !this.result.videoUrl;
    this.videoRetry.buttonEl.hidden = !missing;
    this.videoRetry.setDisabled(Boolean(this.videoBusy)).setButtonText(this.videoBusy ? "正在识别…" : "重新识别视频");
    this.bind.buttonEl.hidden = !missing || this.videoRetryFailedFor !== this.result.file.path;
    this.retry.buttonEl.hidden = true;
    const videoStatus = !missing ? "视频已关联，可点击本地笔记时间点回看" : this.videoBusy ? "正在重新识别当前页的视频，请稍候…" : this.videoRetryFailedFor === this.result.file.path ? "仍未识别到视频。可等待加载后重试，或点“手动补充”查看步骤" : "正文已保存，视频暂未就绪，可点“重新识别视频”再试一次";
    this.status(`${this.result.skipped ? "已导入" : "导入成功"} · ${this.result.file.path} · ${videoStatus}`);
  }
  async retryVideo() {
    if (!this.result || this.result.videoUrl || this.videoBusy || this.disposed) return;
    const result = this.result;
    const expectedUrl = safeWebviewUrl(this.webview);
    this.videoOperationUrl = expectedUrl;
    this.videoBusy = true;
    this.el?.setAttribute("aria-busy", "true");
    this.showResult();
    try {
      const videoUrl = await this.plugin.retryVideoAssociation(result.file, this.webview);
      if (this.disposed || this.result !== result || !sameUrl(safeWebviewUrl(this.webview), expectedUrl)) return;
      result.videoUrl = videoUrl;
      this.videoRetryFailedFor = videoUrl ? null : result.file.path;
    } catch (error) {
      if (this.disposed || this.result !== result || !sameUrl(safeWebviewUrl(this.webview), expectedUrl)) return;
      this.videoRetryFailedFor = result.file.path;
      this.videoBusy = false;
      this.showResult();
      this.status(`正文已保存；重新识别未完成：${messageOf(error)}。也可点“手动补充”查看步骤。`);
      return;
    } finally {
      this.videoBusy = false;
      this.el?.removeAttribute("aria-busy");
      if (!this.disposed && this.result && this.result !== result) this.showResult();
    }
    if (!this.disposed && this.result === result) this.showResult();
  }
  async importNote() {
    if (this.busy || !this.ready || this.disposed) return;
    const expectedUrl = safeWebviewUrl(this.webview);
    if (!sameUrl(expectedUrl, this.url) || netdiskPageKind(expectedUrl) !== "note") {void this.refresh(); return;}
    this.busy = true;
    this.ready = false;
    this.el.setAttribute("aria-busy", "true");
    this.primary.setDisabled(true);
    this.status("请选择保存文件夹…");
    try {
      const folder = await this.plugin.selectImportFolder();
      if (folder === null) {this.busy = false; await this.refresh(); return;}
      try {await this.webview.executeJavaScript("document.querySelectorAll('video,audio').forEach(media => media.pause())", true);} catch (_) {}
      const result = await this.plugin.importWebview(this.webview, {setMessage: text => {
        if (sameUrl(safeWebviewUrl(this.webview), expectedUrl)) this.status(text);
      }}, folder, {reveal: false, expectedUrl});
      if (this.disposed) return;
      if (!sameUrl(safeWebviewUrl(this.webview), expectedUrl)) {this.busy = false; await this.refresh(); return;}
      this.result = result;
      this.showResult();
    } catch (error) {
      if (this.disposed) return;
      if (!sameUrl(safeWebviewUrl(this.webview), expectedUrl)) {this.busy = false; await this.refresh(); return;}
      this.status(`导入失败：${messageOf(error)}。可以在本页重试。`);
      this.ready = true;
      this.primary.setDisabled(false);
    } finally {
      this.busy = false;
      this.el?.removeAttribute("aria-busy");
    }
  }
  destroy() {
    this.disposed = true;
    ++this.version;
    clearTimeout(this.timer);
    this.el?.remove();
  }
};

// Plugin lifecycle and note operations.
var START_MARKER = "<!-- BAIDU_AI_NOTE_START -->";
var END_MARKER = "<!-- BAIDU_AI_NOTE_END -->";
var NetdiskAiNotesPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.observedWebviews = /* @__PURE__ */ new WeakSet();
    this.inlineImportBars = new Map();
  }
  async onload() {
    await this.loadSettings();
    this.addCommand({id: "bind-original-video", name: "补充或更换原视频", checkCallback: checking => {const file = this.getActiveManagedFile(); if (file && !checking) this.showVideoBinding(file); return Boolean(file);}});
    this.addSettingTab(new NetdiskAiNotesSettingTab(this.app, this));
    this.addRibbonIcon("compass", "开始导入百度 AI 笔记", () => this.showImportGuide());
    this.addCommand({id: "start-baidu-import", name: "开始导入百度 AI 笔记", callback: () => this.showImportGuide()});
    this.registerEditorExtension(createTimestampEditorExtension((seconds) => {
      const file = this.app.workspace.getActiveFile();
      if (file) void this.seekFromNote(file.path, seconds);
    }));
    this.addRibbonIcon("file-down", "\u5BFC\u5165\u6216\u540C\u6B65\u767E\u5EA6 AI \u7B14\u8BB0", () => {
      if (this.getActiveManagedFile()) void this.syncCurrentNote();
      else void this.importCurrentNote();
    });
    this.addRibbonIcon("folder-down", "\u6279\u91CF\u5BFC\u5165\u6240\u6709\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 AI \u7B14\u8BB0", () => {
      void this.importAllOpenNotes();
    });
    this.addCommand({
      id: "import-current-baidu-ai-note",
      name: "\u5BFC\u5165\u5F53\u524D\u767E\u5EA6 AI \u7B14\u8BB0",
      callback: () => void this.importCurrentNote()
    });
    this.addCommand({
      id: "import-all-open-baidu-ai-notes",
      name: "\u6279\u91CF\u5BFC\u5165\u6240\u6709\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 AI \u7B14\u8BB0",
      callback: () => void this.importAllOpenNotes()
    });
    this.addCommand({
      id: "sync-current-baidu-ai-note",
      name: "\u540C\u6B65\u5F53\u524D\u767E\u5EA6 AI \u7B14\u8BB0",
      checkCallback: (checking) => {
        const available = Boolean(this.getActiveManagedFile());
        if (available && !checking) void this.syncCurrentNote();
        return available;
      }
    });
    this.addCommand({
      id: "open-corresponding-baidu-video",
      name: "\u6253\u5F00\u5BF9\u5E94\u5927\u89C6\u9891",
      checkCallback: (checking) => {
        var _a;
        const url = (_a = this.getActiveFrontmatter()) == null ? void 0 : _a.video_url;
        const available = typeof url === "string" && isPlaybackUrl(url);
        if (available && !checking) void this.openVideo(url);
        return available;
      }
    });
    this.registerMarkdownPostProcessor((element, context) => {
      var _a;
      const sourceFile = this.app.vault.getAbstractFileByPath(context.sourcePath);
      const sourceFm = sourceFile instanceof import_obsidian4.TFile ? (_a = this.app.metadataCache.getFileCache(sourceFile)) == null ? void 0 : _a.frontmatter : void 0;
      if ((sourceFm == null ? void 0 : sourceFm.source) === "baidu-ai-note") {
        const preview = element.closest(".markdown-preview-view");
        if (preview) preview.addClass("baidu-ai-note");
      }
      const timestamps = element.querySelectorAll(".baidu-ai-timestamp[data-time]");
      timestamps.forEach((timestamp) => {
        timestamp.setAttribute("role", "button");
        timestamp.setAttribute("tabindex", "0");
        const activate = (event) => {
          event.preventDefault();
          const seconds = Number(timestamp.dataset.time);
          if (Number.isFinite(seconds)) void this.seekFromNote(context.sourcePath, seconds);
        };
        timestamp.addEventListener("click", activate);
        timestamp.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") activate(event);
        });
      });
      if ((sourceFm == null ? void 0 : sourceFm.source) === "baidu-ai-note") {
        const videoLinks = element.querySelectorAll(
          'a[href*="pan.baidu.com/"][href*="#t="]'
        );
        videoLinks.forEach((link) => {
          const seconds = secondsFromVideoHref(link.href);
          if (seconds === null) return;
          link.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            void this.seekFromNote(context.sourcePath, seconds);
          });
        });
      }
    });
    this.startWebviewTracking();
  }
  showImportGuide() {
    focusImportWorkspace(this.app);
    const modal = new import_obsidian4.Modal(this.app);
    modal.titleEl.setText("导入百度 AI 笔记");
    modal.contentEl.createEl("p", {text: "① 开启核心插件“网页浏览器”。② 打开网盘并登录，打开 AI 笔记正文；只勾选文件不够。③ 点击导入，完成后会打开本地笔记。"});
    new import_obsidian4.Setting(modal.contentEl).setName("打开百度网盘").addButton(b => b.setButtonText("打开或切回网盘").onClick(async () => {
      modal.close();
      try { await this.openNetdiskEntry(); } catch (error) { new import_obsidian4.Notice(messageOf(error)); }
    }));
    const status = modal.contentEl.createEl("p", {text: "正在检查当前页面…"});
    let selected;
    let selectedUrl;
    let button;
    new import_obsidian4.Setting(modal.contentEl).addButton(b => {
      button = b;
      b.setButtonText("导入这篇笔记").setCta().setDisabled(true).onClick(() => {modal.close(); void this.importCurrentNote(selected, selectedUrl);});
    });
    try {
      selected = findFcbWebview(undefined, this.app);
      if (!selected) status.setText("尚未打开 AI 笔记正文。请先打开笔记文件，再打开此向导。");
      else extractFcbSnapshot(selected).then(snapshot => {
        selectedUrl = snapshot.url;
        status.setText(`已识别：${snapshot.title}。现在可以导入。`);
        button.setDisabled(false);
      }).catch(() => status.setText("笔记正文尚未加载完成。请等待正文显示后重新打开向导。"));
    } catch (error) {status.setText(messageOf(error));}
    modal.open();
  }
  async openNetdiskEntry() {
    const leaf = await openNetdiskEntry(this.app);
    new import_obsidian4.Notice("已切到中央的百度网盘页面。请打开要导入的 AI 笔记正文。", 6e3);
    return leaf;
  }
  showImportResult(result) {
    const modal = new import_obsidian4.Modal(this.app);
    modal.titleEl.setText(result.skipped ? "这篇笔记已经导入" : "笔记已导入成功");
    modal.contentEl.createEl("p", {text: `本地笔记：${result.file.path}`});
    const message = modal.contentEl.createEl("p", {text: result.videoUrl ? "原视频已关联，可点击笔记时间点跳转。" : "正文已保存，视频暂未就绪。先重新识别一次，仍未找到时再按步骤手动补充，也可以稍后处理。"});
    new import_obsidian4.Setting(modal.contentEl).addButton(b => b.setButtonText("查看本地笔记").setCta().onClick(async () => {modal.close(); await this.openFileReplacingWebview(null, result.file);}));
    if (!result.videoUrl) {
      let manual;
      new import_obsidian4.Setting(modal.contentEl)
        .addButton(b => b.setButtonText("重新识别视频").onClick(async () => {
          b.setDisabled(true).setButtonText("正在识别…");
          message.setText("正在重新识别对应笔记页的视频，请稍候…");
          try {
            const url = this.app.metadataCache.getFileCache(result.file)?.frontmatter?.fcb_url;
            const view = getWebviews().find(view => isEmbeddedVideoUrl(safeWebviewUrl(view)) && sameUrl(safeWebviewUrl(view), url));
            result.videoUrl = await this.retryVideoAssociation(result.file, view);
            message.setText(result.videoUrl ? "视频已关联，可以点击本地笔记的时间点回看。" : "仍未识别到视频。可等待网页加载后重试，或点“手动补充”查看步骤。");
            b.buttonEl.hidden = Boolean(result.videoUrl);
            manual.buttonEl.hidden = Boolean(result.videoUrl);
          } catch (error) {message.setText(`重新识别未完成：${messageOf(error)}。也可以手动补充。`); manual.buttonEl.hidden = false;}
          finally {b.setDisabled(false).setButtonText("重新识别视频");}
        }))
        .addButton(b => {manual = b; b.setButtonText("手动补充").onClick(() => {modal.close(); this.showVideoBinding(result.file);}); b.buttonEl.hidden = true;})
        .addButton(b => b.setButtonText("稍后处理").onClick(() => modal.close()));
    }
    modal.open();
  }
  showVideoBinding(file, options = {}) {
    const modal = new import_obsidian4.Modal(this.app);
    modal.titleEl.setText("手动补充原视频");
    modal.contentEl.createEl("p", {text: "正文已经保存。这里补充视频页面地址，用于点击时间点回看，保存后不会自动播放。"});
    const steps = modal.contentEl.createEl("ol");
    steps.createEl("li", {text: "这篇网盘笔记左侧能看到视频？直接点下方“填入这篇笔记页地址”，不用再复制。"});
    steps.createEl("li", {text: "如果笔记页没有视频，请在百度网盘找到对应课程的视频，打开播放页，复制顶部地址栏中的完整网址。"});
    steps.createEl("li", {text: "把网址粘贴到下方，点击“保存关联”。还没找到地址时可先点“暂不补充”，找到后再回来。"});
    let value = "";
    let input;
    new import_obsidian4.Setting(modal.contentEl).setName("视频页面地址").addText(t => {input = t; t.setPlaceholder("粘贴网盘视频页或带视频的笔记页地址").onChange(v => value = v.trim());});
    const sourceUrl = this.app.metadataCache.getFileCache(file)?.frontmatter?.fcb_url;
    if (isEmbeddedVideoUrl(sourceUrl)) new import_obsidian4.Setting(modal.contentEl).addButton(b => b.setButtonText("填入这篇笔记页地址").onClick(() => {value = sourceUrl; input.setValue(value);}));
    const status = modal.contentEl.createEl("p");
    new import_obsidian4.Setting(modal.contentEl).addButton(b => b.setButtonText("保存关联").setCta().onClick(async () => {
      if (!isPlaybackUrl(value)) {status.setText("请填写视频播放页或带视频的 AI 笔记页地址，不能使用文件列表或分享页地址。"); return;}
      b.setDisabled(true);
      try {
        await this.app.fileManager.processFrontMatter(file, fm => {fm.video_url = value;});
        const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
        if (fm?.fcb_url) this.rememberVideoUrl(fm.fcb_url, value);
        modal.close();
        if (options.reveal !== false) await this.openFileReplacingWebview(null, file);
        options.onSaved?.(value);
        new import_obsidian4.Notice("原视频已关联，可以点击笔记时间点跳转。");
      } catch (error) {status.setText(`保存失败：${messageOf(error)}`); b.setDisabled(false);}
    })).addButton(b => b.setButtonText("暂不补充").onClick(() => modal.close()));
    modal.open();
  }
  onunload() {
    var _a;
    (_a = this.webviewObserver) == null ? void 0 : _a.disconnect();
  }
  async loadSettings() {
    var _a;
    const loaded = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded != null ? loaded : {});
    this.settings.videoByFcbUrl = (_a = loaded == null ? void 0 : loaded.videoByFcbUrl) != null ? _a : {};
    // Migrate only historical defaults; keep custom folders and existing files.
    let migrated = false;
    if ((loaded == null ? void 0 : loaded.notesFolder) === "Baidu AI Notes") {
      this.settings.notesFolder = DEFAULT_SETTINGS.notesFolder;
      migrated = true;
    }
    if (["Baidu AI Notes/attachments", "attachments/BaiduAI"].includes(loaded == null ? void 0 : loaded.attachmentsFolder)) {
      this.settings.attachmentsFolder = DEFAULT_SETTINGS.attachmentsFolder;
      migrated = true;
    }
    if (migrated) await this.saveSettings();
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async selectImportFolder() {
    try {
      const folder = this.settings.askNotesFolder
        ? await chooseNotesFolder(this.app, this.settings.notesFolder)
        : this.settings.notesFolder;
      return folder === null ? null : validateNotesFolder(this.app, folder);
    } catch (error) {
      new import_obsidian4.Notice(messageOf(error));
      return null;
    }
  }
  async importCurrentNote(selectedWebview, selectedUrl) {
    let webview;
    try { webview = selectedWebview || findFcbWebview(undefined, this.app); } catch (error) { new import_obsidian4.Notice(messageOf(error)); return; }
    if (!webview) {
      new import_obsidian4.Notice("\u672A\u627E\u5230\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 FCB AI \u7B14\u8BB0\u3002\u8BF7\u5148\u5728 Obsidian Web Viewer \u4E2D\u6253\u5F00\u7B14\u8BB0\u3002");
      return;
    }
    const expectedUrl = selectedUrl || safeWebviewUrl(webview);
    try { await webview.executeJavaScript("document.querySelectorAll('video,audio').forEach(media => media.pause())", true); } catch (_) {}
    const notesFolder = await this.selectImportFolder();
    if (notesFolder === null) return;
    const notice = new import_obsidian4.Notice("\u6B63\u5728\u5BFC\u5165\u767E\u5EA6 AI \u7B14\u8BB0\u2026", 0);
    try {
      const result = await this.importWebview(webview, notice, notesFolder, {expectedUrl});
      notice.hide();
      this.showImportResult(result);
    } catch (error) {
      notice.hide();
      console.error("Netdisk AI Notes Importer import failed", error);
      new import_obsidian4.Notice(`\u5BFC\u5165\u5931\u8D25\uFF1A${messageOf(error)}`, 8e3);
    }
  }
  async importAllOpenNotes() {
    const webviews = getWebviews().filter((view) => isFcbUrl(safeWebviewUrl(view)));
    const entries = webviews.map(webview => ({webview, url: safeWebviewUrl(webview)}));
    if (webviews.length === 0) {
      new import_obsidian4.Notice("\u6CA1\u6709\u627E\u5230\u5DF2\u6253\u5F00\u7684\u767E\u5EA6 FCB AI \u7B14\u8BB0");
      return;
    }
    const notesFolder = await this.selectImportFolder();
    if (notesFolder === null) return;
    const notice = new import_obsidian4.Notice(`\u51C6\u5907\u6279\u91CF\u5BFC\u5165 ${webviews.length} \u7BC7\u767E\u5EA6 AI \u7B14\u8BB0\u2026`, 0);
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const seen = /* @__PURE__ */ new Set();
    for (let index = 0; index < webviews.length; index += 1) {
      const {webview, url} = entries[index];
      const identity = getFcbIdentity(url);
      notice.setMessage(`\u6B63\u5728\u5904\u7406\u7B2C ${index + 1}/${webviews.length} \u7BC7\u2026`);
      if (!url || seen.has(identity)) {
        skipped += 1;
        if (identity) seen.add(identity);
        continue;
      }
      seen.add(identity);
      try {
        const result = await this.importWebview(webview, notice, notesFolder, {expectedUrl: url});
        if (result.skipped) skipped += 1;
        else imported += 1;
      } catch (error) {
        failed += 1;
        console.error("Netdisk AI Notes Importer batch item failed", url, error);
      }
    }
    notice.hide();
    const summary = `\u6279\u91CF\u5BFC\u5165\u5B8C\u6210\uFF1A\u6210\u529F ${imported}\uFF0C\u8DF3\u8FC7 ${skipped}\uFF0C\u5931\u8D25 ${failed}`;
    new import_obsidian4.Notice(summary, failed > 0 ? 1e4 : 6e3);
  }
  async importWebview(webview, notice, notesFolder, options = {}) {
    var _a, _b;
    const currentUrl = safeWebviewUrl(webview);
    const checkPage = () => {
      if (options.expectedUrl && !sameUrl(safeWebviewUrl(webview), options.expectedUrl)) throw new Error("页面已切换，请在目标笔记页面重新导入");
    };
    checkPage();
    const existingBeforeCapture = currentUrl ? this.findImportedFile(currentUrl) : null;
    if (existingBeforeCapture) {
      if (options.reveal !== false) await this.openFileReplacingWebview(webview, existingBeforeCapture);
      const fm = (_a = this.app.metadataCache.getFileCache(existingBeforeCapture)) == null ? void 0 : _a.frontmatter;
      let existingVideoUrl = typeof (fm == null ? void 0 : fm.video_url) === "string" ? fm.video_url : "";
      if (!existingVideoUrl) {
        try {
          const snapshot = await extractFcbSnapshot(webview);
          checkPage();
          existingVideoUrl = await this.associateEmbeddedVideo(existingBeforeCapture, webview, snapshot);
        } catch (_) { /* Existing notes remain usable if the page is not ready. */ }
      }
      return { file: existingBeforeCapture, videoUrl: existingVideoUrl, skipped: true };
    }
    const snapshot = await extractFcbSnapshot(webview);
    checkPage();
    if (options.expectedUrl && !sameUrl(snapshot.url, options.expectedUrl)) throw new Error("笔记已切换，请重新导入");
    notice.setMessage("已识别笔记：" + snapshot.title + "，正在保存正文和图片…");
    const existingAfterCapture = this.findImportedFile(snapshot.url);
    if (existingAfterCapture) {
      if (options.reveal !== false) await this.openFileReplacingWebview(webview, existingAfterCapture);
      const fm = (_b = this.app.metadataCache.getFileCache(existingAfterCapture)) == null ? void 0 : _b.frontmatter;
      const existingVideoUrl = typeof (fm == null ? void 0 : fm.video_url) === "string" ? fm.video_url : "";
      return { file: existingAfterCapture, videoUrl: existingVideoUrl, skipped: true };
    }
    const videoUrl = snapshotPlaybackUrl(snapshot);

    const markdown = await convertHtmlToMarkdown({
      vault: this.app.vault,
      html: snapshot.html,
      noteTitle: snapshot.title,
      attachmentsFolder: noteAttachmentsFolder(notesFolder),
      downloadImages: this.settings.downloadImages,
      videoUrl
    });
    const path = await this.createNotePath(snapshot.title, notesFolder);
    const content = this.composeNote(snapshot.title, snapshot.url, videoUrl, markdown);
    checkPage();
    const file = await this.app.vault.create(path, content);
    if (options.reveal !== false) await this.openFileReplacingWebview(webview, file);
    return { file, videoUrl, skipped: false };
  }
  async syncCurrentNote() {
    const file = this.getActiveManagedFile();
    const frontmatter = this.getActiveFrontmatter();
    const fcbUrl = typeof (frontmatter == null ? void 0 : frontmatter.fcb_url) === "string" ? frontmatter.fcb_url : "";
    if (!file || !fcbUrl) {
      new import_obsidian4.Notice("\u5F53\u524D\u6587\u4EF6\u4E0D\u662F\u7531 Netdisk AI Notes Importer \u7BA1\u7406\u7684\u7B14\u8BB0");
      return;
    }
    const notice = new import_obsidian4.Notice("\u6B63\u5728\u540C\u6B65\u767E\u5EA6 AI \u7B14\u8BB0\u2026", 0);
    try {
      let webview = findFcbWebview(fcbUrl);
      if (!webview) {
        await openInWebViewer(this.app, fcbUrl, this.settings.videoOpenPosition);
        webview = await waitForWebview((view) => isFcbUrl(safeWebviewUrl(view)) && sameUrl(safeWebviewUrl(view), fcbUrl));
      }
      const snapshot = await extractFcbSnapshot(webview);
      const checkPage = () => {if (!sameUrl(safeWebviewUrl(webview), fcbUrl) || !sameUrl(snapshot.url, fcbUrl)) throw new Error("笔记页面已切换，已停止同步");};
      checkPage();
      const videoUrl = isPlaybackUrl(frontmatter.video_url) ? frontmatter.video_url : snapshotPlaybackUrl(snapshot);

      const markdown = await convertHtmlToMarkdown({
        vault: this.app.vault,
        html: snapshot.html,
        noteTitle: snapshot.title,
        attachmentsFolder: noteAttachmentsFolder(file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : ""),
        downloadImages: this.settings.downloadImages,
        videoUrl
      });
      const oldContent = await this.app.vault.read(file);
      if (!oldContent.includes(START_MARKER) || !oldContent.includes(END_MARKER)) {
        throw new Error("\u627E\u4E0D\u5230\u63D2\u4EF6\u7BA1\u7406\u533A\u57DF\u6807\u8BB0\uFF0C\u5DF2\u505C\u6B62\u540C\u6B65\u4EE5\u4FDD\u62A4\u7528\u6237\u5185\u5BB9");
      }
      let synchronizedMarkdown = markdown;
      let addedSections = 0;
      if (this.settings.syncMode === "incremental") {
        const currentManagedMarkdown = extractManagedSection(oldContent);
        const merged = mergeMissingHeadingSections(currentManagedMarkdown, markdown);
        synchronizedMarkdown = merged.markdown;
        addedSections = merged.addedSections;
      }
      const replacement = `${START_MARKER}
${synchronizedMarkdown}
${END_MARKER}`;
      const legacyTitle = file.basename.endsWith(".fcb") || file.basename === "\u767E\u5EA6\u7F51\u76D8\u5728\u7EBF\u6587\u6863";
      const baseContent = legacyTitle ? oldContent.replace(/^#\s+[^\n]+$/m, `# ${snapshot.title}`) : oldContent;
      const newContent = replaceManagedSection(baseContent, replacement);
      checkPage();
      await this.app.vault.modify(file, newContent);
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        if (videoUrl) fm.video_url = videoUrl;
        fm.fcb_id = getFcbIdentity(fcbUrl);
        const current = fm.cssclasses;
        const classes = Array.isArray(current) ? current.map(String) : current ? [String(current)] : [];
        if (!classes.includes("baidu-ai-note")) classes.push("baidu-ai-note");
        fm.cssclasses = classes;
      });
      await this.renameLegacyManagedFile(file, snapshot.title);
      await this.openFileReplacingWebview(webview, file);
      notice.hide();
      if (this.settings.syncMode === "incremental") {
        new import_obsidian4.Notice(`\u589E\u91CF\u540C\u6B65\u5B8C\u6210\uFF1A\u65B0\u589E ${addedSections} \u4E2A\u7AE0\u8282\u5757\uFF1B\u5DF2\u6709\u5185\u5BB9\u53CA\u4FEE\u6539\u5DF2\u4FDD\u7559`);
      } else {
        new import_obsidian4.Notice("\u8986\u76D6\u540C\u6B65\u5B8C\u6210\uFF1B\u7BA1\u7406\u533A\u57DF\u5916\u7684\u7528\u6237\u5185\u5BB9\u5DF2\u4FDD\u7559");
      }
    } catch (error) {
      notice.hide();
      console.error("Netdisk AI Notes Importer sync failed", error);
      new import_obsidian4.Notice(`\u540C\u6B65\u5931\u8D25\uFF1A${messageOf(error)}`, 8e3);
    }
  }
  async seekFromNote(sourcePath, seconds) {
    var _a;
    const file = this.app.vault.getAbstractFileByPath(sourcePath);
    const frontmatter = file instanceof import_obsidian4.TFile ? (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter : void 0;
    const videoUrl = typeof (frontmatter == null ? void 0 : frontmatter.video_url) === "string" ? frontmatter.video_url : "";
    if (!videoUrl || !isPlaybackUrl(videoUrl)) {
      new import_obsidian4.Notice("\u8FD9\u7BC7\u7B14\u8BB0\u8FD8\u6CA1\u6709\u53EF\u7528\u7684\u89C6\u9891\u5730\u5740\u3002\u8BF7\u91CD\u65B0\u5BFC\u5165\u6216\u540C\u6B65\uFF0C\u63D2\u4EF6\u4F1A\u5C1D\u8BD5\u81EA\u52A8\u83B7\u53D6\u3002");
      return;
    }
    try {
      if (!findVideoWebview(videoUrl)) await openInWebViewer(this.app, videoUrl, isEmbeddedVideoUrl(videoUrl) ? "tab" : this.settings.videoOpenPosition);
      let activeVideo;
      try {
        activeVideo = await waitAndSeek(videoUrl, seconds);
      } catch (firstError) {
        if (isEmbeddedVideoUrl(videoUrl)) throw new Error("当前笔记页的视频尚未就绪，请确认已登录并等待视频加载后重试");
        console.debug("Netdisk AI Notes Importer: rebuilding stale video Web Viewer", firstError);
        await openInWebViewer(this.app, videoUrl, this.settings.videoOpenPosition);
        activeVideo = await waitAndSeek(videoUrl, seconds);
      }
      const videoLeaf = this.findLeafForWebview(activeVideo);
      if (videoLeaf) {
        await this.app.workspace.revealLeaf(videoLeaf);
        this.app.workspace.setActiveLeaf(videoLeaf, {focus: true});
      }
    } catch (error) {
      console.error("Netdisk AI Notes Importer seek failed", error);
      new import_obsidian4.Notice(`\u89C6\u9891\u8DF3\u8F6C\u5931\u8D25\uFF1A${messageOf(error)}`, 8e3);
    }
  }
  async openVideo(url) {
    if (!isPlaybackUrl(url)) {
      new import_obsidian4.Notice("\u5F53\u524D\u7B14\u8BB0\u6CA1\u6709\u6709\u6548\u7684\u767E\u5EA6\u5927\u89C6\u9891\u5730\u5740");
      return;
    }
    const existing = findVideoWebview(url);
    if (!existing) await openInWebViewer(this.app, url, isEmbeddedVideoUrl(url) ? "tab" : this.settings.videoOpenPosition);
    else {
      const leaf = this.findLeafForWebview(existing);
      if (leaf) {await this.app.workspace.revealLeaf(leaf); this.app.workspace.setActiveLeaf(leaf, {focus: true});}
    }
  }
  async associateEmbeddedVideo(file, webview, snapshot) {
    if (!snapshot.hasEmbeddedVideo || !isEmbeddedVideoUrl(snapshot.url) || !sameUrl(safeWebviewUrl(webview), snapshot.url)) return "";
    let linked = "";
    await this.app.fileManager.processFrontMatter(file, fm => {
      if (!sameUrl(safeWebviewUrl(webview), snapshot.url) || fm.source !== "baidu-ai-note" || !sameUrl(fm.fcb_url, snapshot.url)) throw new Error("笔记页面已切换，未更改原视频关联");
      // An explicit existing association always wins over automatic detection.
      if (!fm.video_url) fm.video_url = snapshot.url;
      linked = fm.video_url;
    });
    return linked;
  }
  async retryVideoAssociation(file, webview) {
    const expectedUrl = this.app.metadataCache.getFileCache(file)?.frontmatter?.fcb_url;
    const checkPage = () => {
      if (!isEmbeddedVideoUrl(expectedUrl) || !sameUrl(safeWebviewUrl(webview), expectedUrl)) throw new Error("请先打开这篇笔记的网盘正文页，再重新识别视频");
    };
    checkPage();
    for (let attempt = 0; attempt < 3; attempt++) {
      checkPage();
      const snapshot = await extractFcbSnapshot(webview);
      checkPage();
      if (!sameUrl(snapshot.url, expectedUrl)) throw new Error("笔记页面已切换，请在对应笔记页重试");
      if (snapshot.hasEmbeddedVideo) return this.associateEmbeddedVideo(file, webview, snapshot);
      if (attempt < 2) await delay(700);
    }
    return "";
  }
  rememberVideoUrl(fcbUrl, videoUrl) {
    if (!isFcbUrl(fcbUrl) || !isPlaybackUrl(videoUrl)) return;
    if (this.settings.videoByFcbUrl[fcbUrl] === videoUrl) return;
    this.settings.videoByFcbUrl[fcbUrl] = videoUrl;
    void this.saveSettings();
  }
  startWebviewTracking() {
    const attachAll = () => {
      const views = getWebviews();
      for (const [view, bar] of this.inlineImportBars) {
        if (!views.includes(view)) {bar.destroy(); this.inlineImportBars.delete(view);}
      }
      views.forEach(view => this.attachWebview(view));
    };
    attachAll();
    this.webviewObserver = new MutationObserver(attachAll);
    this.webviewObserver.observe(document.body, { childList: true, subtree: true });
    this.register(() => {
      var _a;
      return (_a = this.webviewObserver) == null ? void 0 : _a.disconnect();
    });
    this.register(() => {for (const bar of this.inlineImportBars.values()) bar.destroy(); this.inlineImportBars.clear();});
  }
  attachWebview(webview) {
    if (this.observedWebviews.has(webview)) return;
    this.observedWebviews.add(webview);
    const bar = new InlineImportBar(this, webview);
    this.inlineImportBars.set(webview, bar);
    const refreshBar = () => void bar.refresh();
    for (const name of ["dom-ready", "did-stop-loading", "did-navigate", "did-navigate-in-page"]) {
      webview.addEventListener(name, refreshBar);
      this.register(() => webview.removeEventListener(name, refreshBar));
    }
  }
  getActiveManagedFile() {
    var _a;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
    if (!(view == null ? void 0 : view.file)) return null;
    const fm = (_a = this.app.metadataCache.getFileCache(view.file)) == null ? void 0 : _a.frontmatter;
    return (fm == null ? void 0 : fm.source) === "baidu-ai-note" ? view.file : null;
  }
  findImportedFile(fcbUrl) {
    var _a;
    const identity = getFcbIdentity(fcbUrl);
    if (!identity) return null;
    for (const file of this.app.vault.getMarkdownFiles()) {
      const fm = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
      if ((fm == null ? void 0 : fm.source) !== "baidu-ai-note") continue;
      const storedIdentity = typeof fm.fcb_id === "string" ? fm.fcb_id : typeof fm.fcb_url === "string" ? getFcbIdentity(fm.fcb_url) : "";
      if (storedIdentity === identity) {
        return file;
      }
    }
    return null;
  }
  getActiveFrontmatter() {
    var _a;
    const file = this.app.workspace.getActiveFile();
    return file ? (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter : void 0;
  }
  composeNote(title, fcbUrl, videoUrl, markdown) {
    const frontmatter = [
      "---",
      "source: baidu-ai-note",
      "cssclasses:",
      "  - baidu-ai-note",
      `fcb_id: ${yamlString(getFcbIdentity(fcbUrl))}`,
      `fcb_url: ${yamlString(fcbUrl)}`,
      `video_url: ${yamlString(videoUrl)}`,
      `imported_at: ${yamlString((/* @__PURE__ */ new Date()).toISOString())}`,
      "---"
    ].join("\n");
    return `${frontmatter}

# ${title}

${START_MARKER}
${markdown}
${END_MARKER}
`;
  }
  async createNotePath(title, notesFolder = this.settings.notesFolder) {
    const folder = validateNotesFolder(this.app, notesFolder);
    if (folder) await ensureFolder2(this, folder);
    const stem = sanitizeFileName(title);
    let path = (0, import_obsidian4.normalizePath)(folder ? `${folder}/${stem}.md` : `${stem}.md`);
    let suffix = 2;
    while (this.app.vault.getAbstractFileByPath(path)) {
      path = (0, import_obsidian4.normalizePath)(folder ? `${folder}/${stem}-${suffix}.md` : `${stem}-${suffix}.md`);
      suffix += 1;
    }
    return path;
  }
  async openFileReplacingWebview(webview, file) {
    let target;
    this.app.workspace.iterateAllLeaves(leaf => {if (leaf.view?.file?.path === file.path) target = leaf;});
    target = target || this.app.workspace.getLeaf("tab");
    await target.openFile(file, {active: true});
    this.app.workspace.revealLeaf(target);
  }
  findLeafForWebview(webview) {
    let owner = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      const container = leaf.view.containerEl;
      if (!owner && (container == null ? void 0 : container.contains(webview))) owner = leaf;
    });
    return owner;
  }
  async renameLegacyManagedFile(file, title) {
    var _a, _b;
    const isLegacyName = file.basename.endsWith(".fcb") || file.basename === "\u767E\u5EA6\u7F51\u76D8\u5728\u7EBF\u6587\u6863";
    if (!isLegacyName) return;
    const cleanTitle = sanitizeFileName(title);
    const parentPath = (_b = (_a = file.parent) == null ? void 0 : _a.path) != null ? _b : "";
    const desired = (0, import_obsidian4.normalizePath)(parentPath ? `${parentPath}/${cleanTitle}.md` : `${cleanTitle}.md`);
    if (desired !== file.path && !this.app.vault.getAbstractFileByPath(desired)) {
      await this.app.fileManager.renameFile(file, desired);
    }
  }
};
async function ensureFolder2(plugin, folder) {
  const parts = (0, import_obsidian4.normalizePath)(folder).split("/");
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!plugin.app.vault.getAbstractFileByPath(current)) await plugin.app.vault.createFolder(current);
  }
}
function replaceManagedSection(content, replacement) {
  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER, start + START_MARKER.length);
  if (start < 0 || end < 0) return content;
  return content.slice(0, start) + replacement + content.slice(end + END_MARKER.length);
}
function extractManagedSection(content) {
  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER, start + START_MARKER.length);
  if (start < 0 || end < 0) return "";
  return content.slice(start + START_MARKER.length, end).replace(/^\r?\n/, "").replace(/\r?\n$/, "");
}
function mergeMissingHeadingSections(localMarkdown, remoteMarkdown) {
  const local = parseMarkdownSections(localMarkdown);
  const remote = parseMarkdownSections(remoteMarkdown);
  let addedSections = 0;
  const mergeChildren = (localParent, remoteParent) => {
    var _a;
    for (const remoteChild of remoteParent.children) {
      const key = headingKey((_a = remoteChild.heading) != null ? _a : "");
      const localChild = localParent.children.find(
        (candidate) => {
          var _a2;
          return candidate.level === remoteChild.level && headingKey((_a2 = candidate.heading) != null ? _a2 : "") === key;
        }
      );
      if (localChild) {
        mergeChildren(localChild, remoteChild);
      } else {
        localParent.children.push(remoteChild);
        addedSections += 1;
      }
    }
  };
  mergeChildren(local, remote);
  return { markdown: renderMarkdownSections(local).trim(), addedSections };
}
function parseMarkdownSections(markdown) {
  const root2 = { heading: null, level: 0, body: [], children: [] };
  const stack = [root2];
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{2,6})\s+(.+)$/.exec(line);
    if (!match) {
      stack[stack.length - 1].body.push(line);
      continue;
    }
    const level = match[1].length;
    while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
    const section = { heading: line, level, body: [], children: [] };
    stack[stack.length - 1].children.push(section);
    stack.push(section);
  }
  return root2;
}
function renderMarkdownSections(section) {
  const lines = section.heading ? [section.heading, ...section.body] : [...section.body];
  for (const child of section.children) lines.push(renderMarkdownSections(child));
  return lines.join("\n");
}
function headingKey(heading) {
  return heading.replace(/^#{2,6}\s+/, "").replace(/<span\b[^>]*class=["'][^"']*baidu-ai-timestamp[^"']*["'][^>]*>.*?<\/span>/gi, "").replace(/\[[^\]]+\]\([^)]*pan\.baidu\.com\/(?:pfile\/video|fcb\/edit)[^)]*#t=[^)]*\)/gi, "").replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}
function yamlString(value) {
  return JSON.stringify(value);
}
function getQueryPath2(value) {
  try {
    return new URL(value).searchParams.get("path");
  } catch (e) {
    return null;
  }
}
function sameUrl(left, right) {
  return getFcbIdentity(left) === getFcbIdentity(right);
}
function getFcbIdentity(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const fsid = url.searchParams.get("fsid");
    if (fsid) return `fsid:${fsid}`;
    const path = url.searchParams.get("path");
    if (path) return `path:${path}`;
    url.hash = "";
    url.searchParams.sort();
    return `url:${url.toString()}`;
  } catch (e) {
    return `url:${value}`;
  }
}
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}
function secondsFromVideoHref(value) {
  try {
    const url = new URL(value);
    if (!isPlaybackUrl(value)) return null;
    const raw = new URLSearchParams(url.hash.slice(1)).get("t");
    if (!raw) return null;
    const parts = raw.split(":").map(Number);
    if (parts.some((part) => !Number.isFinite(part))) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts.length === 1 ? parts[0] : null;
  } catch (e) {
    return null;
  }
}
