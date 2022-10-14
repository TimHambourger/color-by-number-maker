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

import App from "App";
import { ACCENT_DARK, ACCENT_LIGHT, GRAY_LIGHT } from "app/colorPalette";
import { put } from "app/nano";
import { store } from "app/store";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

put("body", {
  background: GRAY_LIGHT,
  margin: 0,
});

put("a", {
  color: ACCENT_DARK,
  textDecoration: "none",

  "&:hover": {
    color: ACCENT_LIGHT,
  },
});

put("*", {
  boxSizing: "border-box",
});

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
