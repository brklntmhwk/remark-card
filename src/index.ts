/// <reference types="mdast-util-directive" />

import type { PhrasingContent, Root } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import {
	isContainerDirective,
	isImage,
	isLink,
	isParagraph,
	isText,
} from "./utils.js";

export type Config = {
	customHTMLTags?: {
		enabled: boolean;
	};
	cardGridClass?: string;
	cardClass?: string;
	imageContainerClass?: string;
	contentContainerClass?: string;
};

export const defaultConfig: Readonly<Config> = {
	customHTMLTags: {
		enabled: false,
	},
	imageContainerClass: "image-container",
	contentContainerClass: "content-container",
};

const remarkCard: Plugin<[Config?], Root> = (config?: Partial<Config>) => {
	const mergedConfig = {
		...defaultConfig,
		...config,
	};

	const {
		customHTMLTags,
		cardGridClass,
		cardClass,
		imageContainerClass,
		contentContainerClass,
	} = mergedConfig;

	return (tree) => {
		visit(tree, isContainerDirective, (node) => {
			if (node.name !== "card-grid") return;
			if (node.children.length === 0) return;

			node.data = {
				...node.data,
				hName: customHTMLTags?.enabled ? "card-grid" : "div",
				hProperties: {
					...node.attributes,
					class: cardGridClass || node.attributes?.class || undefined,
				},
			};
		});

		visit(tree, isContainerDirective, (node) => {
			if (node.name !== "card") return;
			if (node.children.length === 0) return;

			const [firstNode, secondNode, ..._restNodes] = node.children;
			if (!isParagraph(firstNode)) return;
			if (firstNode.children.length === 0) return;

			let cardImageOrLink: PhrasingContent;
			let cardContent: PhrasingContent[];
			let cardLabel = "";

			const imageContainer: LeafDirective = {
				type: "leafDirective",
				name: "image-container",
				data: {
					hName: "div",
					hProperties: {
						className: imageContainerClass,
					},
				},
				children: [],
			};

			const contentContainer: LeafDirective = {
				type: "leafDirective",
				name: "content-container",
				data: {
					hName: "div",
					hProperties: {
						className: contentContainerClass,
					},
				},
				children: [],
			};

			if (firstNode.data?.directiveLabel === true) {
				if (!isText(firstNode.children[0])) return;

				cardLabel = firstNode.children[0].value;

				if (!isParagraph(secondNode)) return;
				const [imageOrLink, ...restContent] = secondNode.children;
				cardImageOrLink = imageOrLink;
				cardContent = restContent;
			} else {
				const [imageOrLink, ...restContent] = firstNode.children;
				cardImageOrLink = imageOrLink;
				cardContent = restContent;
			}

			if (isImage(cardImageOrLink)) {
				cardImageOrLink.alt = cardImageOrLink.alt || cardLabel;
			} else if (isLink(cardImageOrLink)) {
				const cardImage = cardImageOrLink.children[0];
				if (!isImage(cardImage)) return;

				cardImage.alt = cardImage.alt || cardLabel;
			} else {
				return;
			}

			imageContainer.children.push(cardImageOrLink);

			for (const contentElem of cardContent) {
				contentContainer.children.push(contentElem);
			}

			node.data = {
				...node.data,
				hName: customHTMLTags?.enabled ? "card" : "div",
				hProperties: {
					class: cardClass || node.attributes?.class || undefined,
					...node.attributes,
				},
			};
			node.children.splice(
				0,
				Number.POSITIVE_INFINITY,
				imageContainer,
				contentContainer,
			);
		});
	};
};

export default remarkCard;
