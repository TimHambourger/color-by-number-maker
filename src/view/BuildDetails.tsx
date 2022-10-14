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

const CX_BUILD_DETAILS = rule({
  textAlign: "right",
  width: "200px",
});

const CX_VERSION_INFO = rule({
  fontSize: "12px",
});

const CX_GITHUB_LINK = rule({
  display: "inline-block",
  marginLeft: "6px",
  verticalAlign: "middle",
});

export interface BuildDetailsProps {
  className?: string;
}

const BuildDetails: React.FC<BuildDetailsProps> = ({ className }) => (
  <div className={cx(CX_BUILD_DETAILS, className)}>
    <span className={CX_VERSION_INFO}>Version {process.env.REACT_APP_VERSION}</span>
    <a
      className={CX_GITHUB_LINK}
      href="https://github.com/TimHambourger/color-by-number-maker"
      target="_blank"
      rel="noreferrer"
    >
      <img src={`${process.env.PUBLIC_URL}/GitHub-Mark-32px.png`} alt="View on GitHub" />
    </a>
  </div>
);
export default BuildDetails;
