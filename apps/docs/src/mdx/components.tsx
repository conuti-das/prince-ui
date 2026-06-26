import type { MDXComponents } from "mdx/types";
import { Playground } from "../playground/Playground";
import { PropsTable } from "./PropsTable";
import { Example } from "./Example";
import { EditorExample } from "./EditorExample";
import { DoDont, Anatomy } from "./Callouts";

export const mdxComponents: MDXComponents = {
  Playground, PropsTable, Example, EditorExample, DoDont, Anatomy,
};
