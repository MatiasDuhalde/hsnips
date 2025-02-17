[![Version](https://vsmarketplacebadge.apphb.com/version-short/draivin.hsnips.svg)](https://marketplace.visualstudio.com/items?itemName=draivin.hsnips)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/draivin.hsnips.svg)](https://marketplace.visualstudio.com/items?itemName=draivin.hsnips)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/draivin.hsnips.svg)](https://marketplace.visualstudio.com/items?itemName=draivin.hsnips)

# HyperSnips for Math

这是一个由 [OrangeX4]() 魔改过的 HyperSnips, 增加了**对 Markdown 和 Latex 中数学环境匹配** 的功能. 并且加入了 `${VISUAL}` 语法的支持.

GitHub 地址: https://github.com/OrangeX4/hsnips

**使用这个插件前, 请把原来的 HyperSnips 插件删除!**
**使用这个插件前, 请把原来的 HyperSnips 插件删除!**
**使用这个插件前, 请把原来的 HyperSnips 插件删除!**

并且 **开启** 在 markdown 下的 **自动补全提示**, 请使用 `Shift + Ctrl + P` 然后输入 `open settings json` 打开配置文件, 然后加入以下部分:

```json
"[markdown]": {
    "editor.quickSuggestions": true
},
```

**安装完成后**, 按下快捷键 `Ctrl + Shift + P`, 输入命令 `Open Snippets Directory`, 就可以打开一个文件夹. 在 **该文件夹** 新建一个文件 `markdown.hsnips`, 并将 [OrangeX4's hsnips](https://github.com/OrangeX4/OrangeX4-HyperSnips/blob/main/markdown.hsnips) 里面的内容输入进去, 保存, 就可以使用了.

先看个 **普通例子**:

```hsnips
snippet RR "R" iAm
\mathbb{R}
endsnippet
```

这是一个在数学环境中自动展开的 Snippet, 它有三个标示符 `iAm`, 分别代表 "在词语内部也会触发", "自动展开" 和 "数学环境".

这个例子会在数学环境内, 自动将 `RR` 展开成为 `\mathbb{R}`, 代表 "实数".

再看个 **正则表达式** 的例子:

``` hsnips
snippet `((\d+)|(\d*)(\\)?([A-Za-z]+)((\^|_)(\{\d+\}|\d))*)/` "Fraction no ()" Am
\frac{``rv = m[1]``}{$1}$0
endsnippet
```

其中 `rv = m[1]` 是 JavaScript 代码, 表示将正则表达式的第一个组 `m[1]` 输出给 "返回值" `rv`, 然后输出出去.

这是一个在数学环境中自动展开的 Snippet, 它有两个标示符 'Am', 分别代表 '自动展开' 和 '数学环境'. 用处是:

```
1/    --->    \frac{1}{}
```

相比于原来的 HyperSnips, 最大特点是, 它只会在数学环境 `$...$`, `$$...$$`, `\(...\)` 和 `\[...\]` 中自动展开!

**还有 `${VISUAL}` 语法:**

```
snippet fr "frac" iAm
\\frac{${1:${VISUAL}}}{$2}
endsnippet
```

这个语法会保存最近选中的内容 (5 秒内), 然后替换掉 `${VISUAL}` 部分.

以下是原来的 `README.md`:

---

![](./images/welcome.gif)

HyperSnips is a snippet engine for vscode heavily inspired by vim's
[UltiSnips](https://github.com/SirVer/ultisnips).

## Usage

To use HyperSnips you create `.hsnips` files on a directory which depends on your platform:

- Windows: `%APPDATA%\Code\User\hsnips\(language).hsnips`
- Mac: `$HOME/Library/Application Support/Code/User/hsnips/(language).hsnips`
- Linux: `$HOME/.config/Code/User/hsnips/(language).hsnips`

You can open this directory by running the command `HyperSnips: Open snippets directory`.
This directory may be customized by changing the setting `hsnips.hsnipsPath`.

The file should be named based on the language the snippets are meant for (e.g. `latex.hsnips`
for snippets which will be available for LaTeX files).
Additionally, you can create an `all.hsnips` file for snippets that should be available on all languages.

### Snippets file

A snippets file is a file with the `.hsnips` extension, the file is composed of two types of blocks:
global blocks and snippet blocks.

Global blocks are JavaScript code blocks with code that is shared between all the snippets defined
in the current file. They are defined with the `global` keyword, as follows:

```lua
global
// JavaScript code
endglobal
```

Snippet blocks are snippet definitions. They are defined with the `snippet` keyword, as follows:

```lua
context expression
snippet trigger "description" flags
body
endsnippet
```

where the `trigger` field is required and the fields `description` and `flags` are optional.

### Trigger

A trigger can be any sequence of characters which does not contain a space, or a regular expression
surrounded by backticks (`` ` ``).

### Flags

The flags field is a sequence of characters which modify the behavior of the snippet, the available
flags are the following:

- `A`: Automatic snippet expansion - Usually snippets are activated when the `tab` key is pressed,
  with the `A` flag snippets will activate as soon as their trigger matches, it is specially useful
  for regex snippets.

- `i`: In-word expansion\* - By default, a snippet trigger will only match when the trigger is
  preceded by whitespace characters. A snippet with this option is triggered regardless of the
  preceding character, for example, a snippet can be triggered in the middle of a word.

- `w`: Word boundary\* - With this option the snippet trigger will match when the trigger is a word
  boundary character. Use this option, for example, to permit expansion where the trigger follows
  punctuation without expanding suffixes of larger words.

- `b`: Beginning of line expansion\* - A snippet with this option is expanded only if the
  tab trigger is the first word on the line. In other words, if only whitespace precedes the tab
  trigger, expand.

- `M`: Multi-line mode - By default, regex matches will only match content on the current line, when
  this option is enabled the last `hsnips.multiLineContext` lines will be available for matching.

- `m`: Math mode

\*: This flag will only affect snippets which have non-regex triggers.

### Snippet body

The body is the text that will replace the trigger when the snippet is expanded, as in usual
snippets, the tab stops `$1`, `$2`, etc. are available.

The full power of HyperSnips comes when using JavaScript interpolation: you can have code blocks
inside your snippet delimited by two backticks (` `` `) that will run when the snippet is expanded,
and every time the text in one of the tab stops is changed.

### Code interpolation

Inside the code interpolation, you have access to a few special variables:

- `rv`: The return value of your code block, the value of this variable will replace the code block
  when the snippet is expanded.
- `t`: An array containing the text within the tab stops, in the same order as the tab stops are
  defined in the snippet block. You can use it to dynamically change the snippet content.
- `m`: An array containing the match groups of your regular expression trigger, or an empty array if
  the trigger is not a regular expression.
- `w`: A URI string of the currently opened workspace, or an empty string if no workspace is open.
- `path`: A URI string of the current document. (untitled documents have the scheme `untitled`)

Additionally, every variable defined in one code block will be available in all the subsequent code
blocks in the snippet.

The `require` function can also be used to import NodeJS modules.

### Context matching

Optionally, you can have a `context` line before the snippet block, it is followed by any javascript
expression, and the snippet is only available if the `context` expression evaluates to `true`.

Inside the `context` expression you can use the `context` variable, which has the following type:

```ts
interface Context {
  scopes: string[];
}
```
Here, `scopes` stands for the TextMate scopes at the current cursor position, which can be viewed by
running the `Developer: Inspect Editor Tokens and Scopes` command in `vscode`.

As an example, here is an automatic LaTeX snippet that only expands when inside a math block:

```lua
global
function math(context) {
    return context.scopes.some(s => s.startsWith("meta.math"));
}
endglobal

context math(context)
snippet inv "inverse" Ai
^{-1}
endsnippet
```

## Examples

- Simple snippet which greets you with the current date and time

```lua
snippet dategreeting "Gives you the current date!"
Hello from your hsnip at ``rv = new Date().toDateString()``!
endsnippet
```

- Box snippet as shown in the gif above

```lua
snippet box "Box" A
``rv = '┌' + '─'.repeat(t[0].length + 2) + '┐'``
│ $1 │
``rv = '└' + '─'.repeat(t[0].length + 2) + '┘'``
endsnippet
```

- Snippet to insert the current filename

```lua
snippet filename "Current Filename"
``rv = require('path').basename(path)``
endsnippet
```
