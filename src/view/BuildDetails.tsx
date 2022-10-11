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
