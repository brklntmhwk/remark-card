import type { Link, List, Paragraph, Parent, Text, Image } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import type { Node } from "unist";

function isObject(target: unknown): target is { [k: string]: unknown } {
  return typeof target === "object" && target !== null;
}

function isNode(node: unknown): node is Node {
  return isObject(node) && "type" in node;
}

function is<T extends Node>(node: unknown, type: string): node is T {
  return isNode(node) && node.type === type;
}

export function isParent(node: unknown): node is Parent {
  return is(node, "node") && "children" in node;
}

export function isImage(node: unknown): node is Image {
  return is(node, "image");
}

export function isLink(node: unknown): node is Link {
  return is(node, "link");
}

export function isList(node: unknown): node is List {
  return is(node, "list");
}

export function isParagraph(node: unknown): node is Paragraph {
  return is(node, "paragraph");
}

export function isText(node: unknown): node is Text {
  return is(node, "text");
}

export function isContainerDirective(
  node: unknown
): node is ContainerDirective {
  return is(node, "ContainerDirective");
}
