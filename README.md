# remark-card

A remark plugin to parse card layout component(s).

## Features

- Compatible with the proposed generic syntax for custom directives/plugins in Markdown
- Fully customizable styles
- Written in TypeScript

## How to Use

### Syntax

For example, the following Markdown content:

```markdown
:::card{.card.solid}
![image alt](https://xxxxx.com/sample.jpg)
Card content
:::
```

Yields:

```html
<div class="card solid">
  <div><img src="https://xxxxx.com/sample.jpg" alt="image alt" /></div>
  <div>Card content</div>
</div>
```

### Installation

To install the plugin:

With `npm`:

```bash
npm install remark-card --save-dev
```

With `yarn`:

```bash
yarn add --dev remark-card
```

With `pnpm`:

```bash
pnpm add -D remark-card
```

With `bun`:

```bash
bun install -D remark-card
```

###
