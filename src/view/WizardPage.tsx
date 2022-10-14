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

import { rule } from "app/nano";
import cx from "classnames";
import React, { PropsWithChildren } from "react";

export const WIZARD_PAGE_WIDTH_PX = 600;

const CX_WIZARD_PAGE = rule({
  margin: "10px auto",
  width: `${WIZARD_PAGE_WIDTH_PX}px`,

  "@media print": {
    "&": {
      margin: 0,
      width: "fit-content",
    },
  },
});

export interface WizardPageProps {
  className?: string;
}

const WizardPage: React.FC<PropsWithChildren<WizardPageProps>> = ({ className, children }) => (
  <div className={cx(CX_WIZARD_PAGE, className)}>{children}</div>
);
export default WizardPage;
