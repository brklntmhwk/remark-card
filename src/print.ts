import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkCard from "./index";

const normalizeHtml = (html: string) => {
	return html.replace(/[\n\s]*(<)|>([\n\s]*)/g, (match, p1, p2) =>
		p1 ? "<" : ">",
	);
};

const parseMarkdown = async (markdown: string, debug = false) => {
	const remarkProcessor = unified()
		.use(remarkParse)
		.use(remarkDirective)
		.use(remarkCard)
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
};

const markdown1 = `
:::card{.card1.solid}
![image alt](https://xxxxx.xxx/yyy.jpg)
mark
down
1
:::
`;

const markdown2 = `
:::card[card alt]{.card2.double}
![](https://xxxxx.xxx/yyy.jpg)
mark
down
2
following sentence
[link alt](https://google.com/)
**strong sentence**
:::
`;

const markdown3 = `
:::card[card alt]{.card3.dashed}
[![image alt](https://xxxxx.xxx/yyy.jpg)](https://unsplash.com)
mark
down
3
:::
`;

const markdown4 = `
::::card-grid
:::card[card alt]{.card4-1.solid}
![image alt](https://xxxxx.xxx/yyy.jpg)
card 4-1
:::
:::card[card alt]{.card4-2.solid}
![image alt](https://xxxxx.xxx/yyy.jpg)
card 4-2
:::
:::card[card alt]{.card4-3.solid}
![image alt](https://xxxxx.xxx/yyy.jpg)
card 4-3
:::
::::
`;

const markdown5 = `
::::card-grid{.card-grid}
:::card[card alt]{.card5-1.double}
![image alt](https://xxxxx.xxx/yyy.jpg)
card 5-1
:::
:::card[card alt]{.card5-2.double}
![image alt](https://xxxxx.xxx/yyy.jpg)
card 5-2
:::
:::card[card alt]{.card5-3.double}
![image alt](https://xxxxx.xxx/yyy.jpg)
card 5-3
:::
::::
`;

await parseMarkdown(markdown1, true);
await parseMarkdown(markdown2, true);
await parseMarkdown(markdown3, true);
await parseMarkdown(markdown4, true);
await parseMarkdown(markdown5, true);
