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
  imageContainerClass: string;
  contentContainerClass: string;
}

export const defaultConfig: Config = {
  customHTMLTags: {
    enabled: false,
  },
  imageContainerClass: "image-container",
  contentContainerClass: "content-container",
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
          ...node.attributes,
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
            className: config.imageContainerClass,
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
            className: config.contentContainerClass,
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
        hName: config.customHTMLTags.enabled ? "card" : "div",
        hProperties: {
          ...node.attributes,
        },
      };
      node.children.splice(
        0,
        Number.POSITIVE_INFINITY,
        imageContainer,
        contentContainer
      );
    });
  };
};

export default remarkCard;
