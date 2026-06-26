import type { MDXComponents } from "mdx/types";
import { Playground } from "../playground/Playground";
import { PropsTable } from "./PropsTable";
import { Example } from "./Example";
import { DoDont, Anatomy } from "./Callouts";

export const mdxComponents: MDXComponents = {
  Playground, PropsTable, Example, DoDont, Anatomy,
};
