/// <reference types="mdast-util-directive" />

import type { PhrasingContent, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import {
  isLink,
  isList,
  isParagraph,
  isParent,
  isImage,
  isText,
  isContainerDirective,
} from "./utils";
import type { LeafDirective } from "mdast-util-directive";

type BorderStyleMap = {
  className: string;
  markdownSymbol: string;
};

interface Options {
  borderStyleList?: BorderStyleMap[];
}

const defaultBorderStyleList: Readonly<BorderStyleMap[]> = [
  {
    className: "solid",
    markdownSymbol: "-",
  },
  {
    className: "double",
    markdownSymbol: "=",
  },
  {
    className: "dotted",
    markdownSymbol: ".",
  },
  {
    className: "dashed",
    markdownSymbol: "~",
  },
];

const parseSign = (
  sign: string | undefined,
  borderStyles: Readonly<BorderStyleMap[]>
): string | undefined => {
  if (sign === undefined || sign === "") return;

  const defaultSymbol = borderStyles[0]?.markdownSymbol;
  if (defaultSymbol === undefined) return;

  const symbols = borderStyles.map((style) => style.markdownSymbol);
  const reg = new RegExp(`@(?<borderType>[${symbols.join()}])?$`);
  const matched = sign.match(reg);

  const borderTypeSign = matched?.groups?.borderType;
  let borderType: string = defaultSymbol;

  for (const style of borderStyles) {
    if (borderTypeSign === style.markdownSymbol) {
      borderType = style.className;
    }
  }

  return borderType;
};

// In terms of separation of concerns, what this plugin is in charge of is just to parse Markdown content into decent HTML tags. CSS things have nothing to do with it.
// Perhaps it's no concern of it to check whether content comes as a list or not either.
// :::card
// ![alt](imgUrl) or [![alt](imgUrl)](linkUrl)
// card content here.
// :::

const remarkCard: Plugin<[Options?], Root> = (options = {}) => {
  const { borderStyleList = defaultBorderStyleList } = options;

  return (tree) => {
    visit(tree, isContainerDirective, (node) => {
      if (!(node.name === "card")) return;
      if (node.children.length === 0) return;

      const [firstNode, secondNode, ...restNodes] = node.children;
      if (!isParagraph(firstNode)) return;
      if (firstNode.children.length === 0) return;

      let cardImageOrLink: PhrasingContent;

      if (firstNode.data?.directiveLabel === true) {
        if (!isText(firstNode.children[0])) return;

        const cardLabel = firstNode.children[0].value;

        if (!isParagraph(secondNode)) return;
        cardImageOrLink = secondNode.children[0];

        if (isImage(cardImageOrLink)) {
          cardImageOrLink.alt = cardImageOrLink.alt ?? cardLabel;
        } else if (isLink(cardImageOrLink)) {
          const cardImage = cardImageOrLink.children[0];
          if (!isImage(cardImage)) return;

          cardImage.alt = cardImage.alt ?? cardLabel;
        } else {
          return;
        }
      } else {
        cardImageOrLink = firstNode.children[0];
      }

      const imageWrapper: LeafDirective = {
        type: "leafDirective",
        name: "image-wrapper",
        data: {
          hName: "div",
        },
        children: [cardImageOrLink],
      };

      const content: LeafDirective = {
        type: "leafDirective",
        name: "card-content",
        data: {
          hName: "div",
        },
        children: [],
      };

      restNodes.forEach((contentNode, index, thisArr) => {
        if (!isParagraph(contentNode)) return;
        if (contentNode.children.length === 0) return;

        const cardContent = contentNode.children[0];
        if (isText(cardContent)) {
          content.children.push(cardContent);
        } else {
          if (!isParent(cardContent)) return;
          if (cardContent.children.length === 0) return;
          if (!isText(cardContent.children[0])) return;

          content.children.push(cardContent);
        }

        if (thisArr.length !== index) {
          contentNode.children.push({
            type: "text",
            value: "\n",
          });
        }
      });

      node.children.splice(0, Infinity, imageWrapper, content);
    });
  };
};

export default remarkCard;
