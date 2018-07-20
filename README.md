# parse-literals

_Because sometimes you literally need to parse template literals._

## Why?

Template literals are often used in JavaScript for HTML and CSS. This library allows developers to extract the strings from the literals for post processing, such as minifying or linting.

## Usage

```js
const pl = import * as pl from 'parse-literals';
// const pl = require('parse-literals');

const templates = pl.parseLiterals(`
  render() {
    return html\`
      <h1>\${"Hello World"}</h1>
    \`;
  }
`);

console.log(templates);
// [
//   {
//     "tag": "html",
//     "parts": [
//       {
//         "text": "\n      <h1>",
//         "start": 30,
//         "end": 41
//       },
//       {
//         "text": "</h1>\n    ",
//         "start": 57,
//         "end": 67
//       }
//     ]
//   }
// ]
```

## Supported Source Syntax

- JavaScript
- TypeScript
