# remark-card

A remark plugin to parse card layout component(s). It consists of these two elements:

- `card-grid`
  - A container for cards that helps users work on the CSS grid layout or the likes
- `card`
  - Self-explanatory

## Features

- Compatible with [the proposed generic syntax](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444/1) for custom directives/plugins in Markdown
- Fully customizable styles
- Written in TypeScript
- ESM only

## How to Use

### Installation

To install the plugin:

With `npm`:

```bash
npm install remark-card
```

With `yarn`:

```bash
yarn add remark-card
```

With `pnpm`:

```bash
pnpm add remark-card
```

With `bun`:

```bash
bun install remark-card
```

### Usage

General usage:

```js
import rehypeStringify from "rehype-stringify";
import remarkCard from "remark-card";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const normalizeHtml = (html: string) => {
  return html.replace(/[\n\s]*(<)|>([\n\s]*)/g, (_match, p1, _p2) =>
    p1 ? "<" : ">"
  );
};

const parseMarkdown = async (markdown: string) => {
  const remarkProcessor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkCard)
    .use(remarkRehype)
    .use(rehypeStringify);

  const output = String(await remarkProcessor.process(markdown));

  return output;
}

const input = `
:::card
![image alt](https://xxxxx.xxx/yyy.jpg)
Card content
`

const html = await parseMarkdown(input);

console.log(normalizeHtml(html));
```

Yields:

```html
<div>
  <div class="image-container">
    <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt" />
  </div>
  <div class="content-container">Card content</div>
</div>
```

At the moment, it takes the following option(s):

```ts
export type Config = {
  // Whether or not to use custom HTML tags for both `card` and `card-grid`. By default, it's set to `false`.
  customHTMLTags?: {
    enabled: boolean;
  };
  cardGridClass?: string;
  cardClass?: string;
  imageContainerClass?: string;
  contentContainerClass?: string;
}
```

> [!NOTE]
> Why do we need those card & card grid class options?
> \- Since [MDX 2](https://mdxjs.com/blog/v2/), the compiler has come to throw an error "Could not parse expression with acorn: $error" whenever there are unescaped curly braces and the expression inside them is invalid. This breaking change leads the directive syntax (`:::xxx{a=b}`) to cause the error, so the options are like an escape hatch for that situation.

For more possible patterns and in-depths explanations on the generic syntax(e.g., `:::something[...]{...}`), see `./test/index.test.ts` and [this page](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444/1), respectively.

### Syntax

#### card

For example, the following Markdown content:

```markdown
:::card{.card#card-id}
![image alt](https://xxxxx.xxx/yyy.jpg)
Card content
:::
```

Yields:

```html
<div id="card-id" class="card">
  <div class="image-container">
    <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt" />
  </div>
  <div class="content-container">Card content</div>
</div>
```

#### card-grid

The `card-grid` element can be used in combination with the `card` element.

For example, the following Markdown content:

```markdown
::::card-grid{.card-grid}
:::card{.card-1}
![card 1](https://xxxxx.xxx/yyy.jpg)
Card 1
:::
:::card{.card-2}
![card 2](https://xxxxx.xxx/yyy.jpg)
Card 2
:::
:::card{.card-3}
![card 3](https://xxxxx.xxx/yyy.jpg)
Card 3
:::
::::
```

Yields:

```html
<div class="card-grid">
  <div class="card-1">
    <div class="image-container">
      <img src="https://xxxxx.xxx/yyy.jpg" alt="card 1">
    </div>
    <div class="content-container">Card 1</div>
  </div>
  <div class="card-2">
    <div class="image-container">
      <img src="https://xxxxx.xxx/yyy.jpg" alt="card 2">
    </div>
    <div class="content-container">Card 2</div>
  </div>
  <div class="card-3">
    <div class="image-container">
      <img src="https://xxxxx.xxx/yyy.jpg" alt="card 3">
    </div>
    <div class="content-container">Card 3</div>
  </div>
</div>
```

### Astro

If you want to use this in your [Astro](https://astro.build/) project, note that you need to install `remark-directive` and add it to the `astro.config.{js,mjs,ts}` file simultaneously.

```ts title="astro.config.ts"
import { defineConfig } from 'astro/config';
import remarkCard from "remark-card";
import remarkDirective from "remark-directive";
// ...

export default defineConfig({
  // ...
  markdown: {
    // ...
    remarkPlugins: [
      // ...
      remarkDirective,
      remarkCard,
      // ...
    ]
    // ...
  }
  // ...
})
```

Also, if you want to use your Astro component(s) for customization purposes, make sure to set the `customHTMLTags.enabled` to `true` and assign your custom components like this:

`~/lib/mdx-components.ts`
```ts
import { Card, CardGrid } from '~/components/elements/Card';
// ...

export const mdxComponents = {
  // ...
  card: Card,
  'card-grid': CardGrid,
  // ...
};
```

`~/pages/page.astro`
```astro
---
import { mdxComponents } from '~/lib/mdx-components';

// ...

const { page } = Astro.props;
const { Content } = await page.render();
---

<Layout>
  <Content components={mdxComponents}>
</Layout>
```

### How it works

Some key takeaways are:

- The former will be prioritized and used as the alt value of `img` if both the image alt and the card alt are provided
- Both `card` and `card-grid` take common & custom HTML attributes
  - their styles are customizable by providing user-defined CSS class(es)
    - e.g., `border`, `background-color`, etc.
- The default values of this plugin's options:
  - `customHTMLTags.enabled`: `false`
  - `imageContainerClass`: "image-container"
  - `contentContainerClass`: "content-container"

## Feature(s) pending to be added

- Nested cards
  - It seems technically feasible but the use case of this might be rare
~~- Customizable class names for image & content containers~~

## TODO(s)

- [ ] add a demo screenshot of the actual `card-grid` & `card` combination to this page
- [x] add customizable class name options for image & content containers

## License

This project is licensed under the MIT License, see the LICENSE file for more details.
