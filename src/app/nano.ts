import { create } from "nano-css";
import { addon as addonCache } from "nano-css/addon/cache";
// For some reason nano-css doesn't provide .d.ts files for all of its addons. Hence the @ts-ignore-error lines below.
//@ts-ignore-error
import { addon as addonNesting } from "nano-css/addon/nesting";
import { addon as addonRule } from "nano-css/addon/rule";
//@ts-ignore-error
import { addon as addonSourcemaps } from "nano-css/addon/sourcemaps";
import { createElement } from "react";

export const nano = create({ h: createElement });

addonCache(nano);
addonNesting(nano);
addonRule(nano);
if (process.env.NODE_ENV !== "production") addonSourcemaps(nano);

const { put } = nano;
const rule = nano.rule!;
export { put, rule };
