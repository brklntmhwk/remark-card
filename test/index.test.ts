// https://bun.sh/docs/cli/test

import { expect, test } from "bun:test";
import { unified } from "unified";
import remarkCard from "..";

const parseMarkdown = async (mdStr: string) => {
  const remarkProcessor = unified().use(remarkCard);
};

test("2 + 2", () => {
  expect(2 + 2).toBe(4);
});
