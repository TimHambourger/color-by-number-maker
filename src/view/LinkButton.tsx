import { ACCENT_DARK, ACCENT_LIGHT } from "app/colorPalette";
import { rule } from "app/nano";
import { styledButton } from "./styledButton";

export default styledButton(
  rule({
    background: "none",
    border: "none",
    color: ACCENT_DARK,
    cursor: "pointer",
    fontSize: "14px",
    "&:hover": {
      color: ACCENT_LIGHT,
    },
  }),
);
