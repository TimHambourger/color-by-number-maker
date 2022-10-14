/**
 * Copyright 2022 Tim Hambourger
 *
 * This file is part of Color by Number Maker.
 *
 * Color by Number Maker is free software: you can redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * Color by Number maker is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with Color by Number Maker. If not, see
 * <https://www.gnu.org/licenses/>.
 */

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
// Sourcemaps are really useful for debugging styling, but they delay application startup by a second or two, so we
// suppress them in production.
if (process.env.NODE_ENV !== "production") addonSourcemaps(nano);

const { put } = nano;
const rule = nano.rule!;
export { put, rule };
