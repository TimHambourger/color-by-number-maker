import cx from "classnames";
import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from "react";

export const styledButton =
  (baseClassName: string): FC<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> =>
  ({ children, className, ...props }) =>
    (
      <button className={cx(baseClassName, className)} {...props}>
        {children}
      </button>
    );
