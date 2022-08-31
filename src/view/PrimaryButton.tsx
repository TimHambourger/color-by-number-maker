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
