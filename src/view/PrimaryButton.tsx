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

import { ACCENT_DARK, ACCENT_LIGHT, ACCENT_LIGHTER, WHITE } from "app/colorPalette";
import { rule } from "app/nano";
import { styledButton } from "./styledButton";

export default styledButton(
  rule({
    background: ACCENT_DARK,
    border: "none",
    borderRadius: "4px",
    color: WHITE,
    cursor: "pointer",
    padding: "8px",
    textTransform: "uppercase",
    "&:hover": {
      background: ACCENT_LIGHT,
    },
    "&:disabled": {
      background: ACCENT_LIGHTER,
      cursor: "not-allowed",
    },
  }),
);
