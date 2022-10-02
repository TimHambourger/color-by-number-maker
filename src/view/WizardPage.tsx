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
