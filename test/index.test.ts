// https://bun.sh/docs/cli/test

import { describe, expect, mock, test } from "bun:test";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkCard, { type Config, defaultConfig } from "../src/index.js";

const normalizeHtml = (html: string) => {
	return html.replace(/[\n\s]*(<)|>([\n\s]*)/g, (_match, p1, _p2) =>
		p1 ? "<" : ">",
	);
};

const parseMarkdown = mock(
	async (markdown: string, options: Config = defaultConfig, debug = false) => {
		const remarkProcessor = unified()
			.use(remarkParse)
			.use(remarkDirective)
			.use(remarkCard, options)
			.use(remarkRehype)
			.use(rehypeStringify);

		if (debug) {
			const remarkOutput = await remarkProcessor.run(
				remarkProcessor.parse(markdown),
			);
			console.log("Remark output:", JSON.stringify(remarkOutput, null, 2));
		}

		const output = String(await remarkProcessor.process(markdown));

		if (debug) {
			console.log(
				`HTML output:
      ${normalizeHtml(output)}`,
			);
		}

		return output;
	},
);

describe("Test the basic usage of card", () => {
	test("Card with single-line text & image", async () => {
		const input = `
  :::card
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  Single-line text
  :::
    `;
		const output = `
    <div>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div>Single-line text</div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with class attributes and single-line text & image", async () => {
		const input = `
  :::card{.card.solid-border}
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  Single-line text
  :::
    `;
		const output = `
    <div class="card solid-border">
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div>Single-line text</div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with a directive label and single-line text & image with no alt text", async () => {
		const input = `
  :::card[card alt]
  ![](https://xxxxx.xxx/yyy.jpg)
  Single-line text
  :::
    `;
		const output = `
    <div>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="card alt">
      </div>
      <div>Single-line text</div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with a directive label and single-line text & image", async () => {
		const input = `
  :::card[card alt]
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  Single-line text
  :::
    `;
		const output = `
    <div>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div>Single-line text</div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with multiple-line text & image", async () => {
		const input = `
  :::card
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  Multiple
  Line
  Text
  :::
    `;
		const output = `
    <div>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div>Multiple\nLine\nText
      </div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with strong text & image", async () => {
		const input = `
  :::card
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  **Strong text**
  :::
    `;
		const output = `
    <div>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div><strong>Strong text</strong></div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with link text & image", async () => {
		const input = `
  :::card
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  [Link text](https://xxxxx.xxx/)
  :::
    `;
		const output = `
    <div>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div>
        <a href="https://xxxxx.xxx/">Link text</a>
      </div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with emphasized text & image", async () => {
		const input = `
  :::card
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  _Emphasized text_
  :::
    `;
		const output = `
    <div>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div>
        <em>Emphasized text</em>
      </div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with image & image", async () => {
		const input = `
  :::card
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  ![image alt 2](https://xxxxx.xxx/zzz.jpg)
  :::
    `;
		const output = `
    <div>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div>
        <img src="https://xxxxx.xxx/zzz.jpg" alt="image alt 2">
      </div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card with single-line text & image link", async () => {
		const input = `
  :::card
  [![image alt](https://xxxxx.xxx/yyy.jpg)](https://xxxxx.xxx/)
  Single-line text
  :::
    `;
		const output = `
    <div>
      <div>
        <a href="https://xxxxx.xxx/">
          <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
        </a>
      </div>
      <div>Single-line text</div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	// test("Nested cards", async () => {
	//   const input = `
	// :::::card{.parent}
	// ![parent card](https://xxxxx.xxx/xxx.jpg)
	// Parent
	// ::::card{.child}
	// ![child card](https://xxxxx.xxx/yyy.jpg)
	// Child
	// :::card{.grandchild}
	// ![grandchild card](https://xxxxx.xxx/zzz.jpg)
	// Grandchild
	// :::
	// ::::
	// :::::
	//   `;
	//   const output = `
	//   <div class="parent">
	//     <div>
	//       <img src="https://xxxxx.xxx/xxx.jpg" alt="parent card">
	//     </div>
	//     <div>
	//       Parent
	//       <div class="child">
	//         <div>
	//           <img src="https://xxxxx.xxx/yyy.jpg" alt="child card">
	//         </div>
	//         <div>
	//           Child
	//           <div class="grandchild">
	//             <div>
	//               <img src="https://xxxxx.xxx/zzz.jpg" alt="grandchild card">
	//             </div>
	//             <div>
	//               Grandchild
	//             </div>
	//           </div>
	//         </div>
	//       </div>
	//     </div>
	//   </div>
	//   `;

	//   const html = await parseMarkdown(input);

	//   expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	// });

	test("Card with no content", async () => {
		const input = `
  :::card
  :::
    `;
		const output = `
    <div></div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Custom Tag Card with single-line text & image", async () => {
		const input = `
  :::card
  ![image alt](https://xxxxx.xxx/yyy.jpg)
  Single-line text
  :::
    `;
		const output = `
    <card>
      <div>
        <img src="https://xxxxx.xxx/yyy.jpg" alt="image alt">
      </div>
      <div>Single-line text</div>
    </card>
    `;

		const html = await parseMarkdown(input, {
			customHTMLTags: { enabled: true },
		});

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});
});

describe("Test the basic usage of card-grid", () => {
	test("Card grid & some cards", async () => {
		const input = `
  ::::card-grid
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
    `;
		const output = `
    <div>
      <div class="card-1">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 1">
        </div>
        <div>Card 1</div>
      </div>
      <div class="card-2">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 2">
        </div>
        <div>Card 2</div>
      </div>
      <div class="card-3">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 3">
        </div>
        <div>Card 3</div>
      </div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card grid with class attributes & some cards", async () => {
		const input = `
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
    `;
		const output = `
    <div class="card-grid">
      <div class="card-1">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 1">
        </div>
        <div>Card 1</div>
      </div>
      <div class="card-2">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 2">
        </div>
        <div>Card 2</div>
      </div>
      <div class="card-3">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 3">
        </div>
        <div>Card 3</div>
      </div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card grid with a directive label & some cards", async () => {
		const input = `
  ::::card-grid[Card grid label]
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
    `;
		const output = `
    <div>
      <p>Card grid label</p>
      <div class="card-1">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 1">
        </div>
        <div>Card 1</div>
      </div>
      <div class="card-2">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 2">
        </div>
        <div>Card 2</div>
      </div>
      <div class="card-3">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 3">
        </div>
        <div>Card 3</div>
      </div>
    </div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Card grid & no card", async () => {
		const input = `
  ::::card-grid
  ::::
    `;
		const output = `
    <div></div>
    `;

		const html = await parseMarkdown(input);

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});

	test("Custom Tag Card grid & some cards", async () => {
		const input = `
  ::::card-grid
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
    `;
		const output = `
    <card-grid>
      <card class="card-1">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 1">
        </div>
        <div>Card 1</div>
      </card>
      <card class="card-2">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 2">
        </div>
        <div>Card 2</div>
      </card>
      <card class="card-3">
        <div>
          <img src="https://xxxxx.xxx/yyy.jpg" alt="card 3">
        </div>
        <div>Card 3</div>
      </card>
    </card-grid>
    `;

		const html = await parseMarkdown(input, {
			customHTMLTags: { enabled: true },
		});

		expect(normalizeHtml(html)).toBe(normalizeHtml(output));
	});
});
