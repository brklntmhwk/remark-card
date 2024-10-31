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

export interface Config {
  customHTMLTags: {
    enabled: boolean;
  };
}

const defaultConfig: Config = {
  customHTMLTags: {
    enabled: false,
  },
};

const remarkCard: Plugin<[Config?], Root> = (config = defaultConfig) => {
  return (tree) => {
    visit(tree, isContainerDirective, (node) => {
      if (node.name !== "card-grid") return;
      if (node.children.length === 0) return;

      node.data = {
        ...node.data,
        hName: config.customHTMLTags.enabled ? "card-grid" : "div",
        hProperties: {
          class: node.attributes?.class,
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

      const imageWrapper: LeafDirective = {
        type: "leafDirective",
        name: "image-wrapper",
        data: {
          hName: "div",
        },
        children: [],
      };

      const content: LeafDirective = {
        type: "leafDirective",
        name: "card-content",
        data: {
          hName: "div",
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

      imageWrapper.children.push(cardImageOrLink);

      for (const contentElem of cardContent) {
        content.children.push(contentElem);
      }

      node.data = {
        ...node.data,
        hName: config.customHTMLTags.enabled ? "card" : "div",
        hProperties: {
          class: node.attributes?.class,
        },
      };
      node.children.splice(0, Number.POSITIVE_INFINITY, imageWrapper, content);
    });
  };
};

export default remarkCard;
