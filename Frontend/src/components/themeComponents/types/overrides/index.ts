// material-ui
// eslint-disable-next-line

import "./Alert";
import "./Badge";
import "./Button";
import "./Checkbox";
import "./Chip";
import "./createPalette";
import "./createTheme";
import "./Pagination";
import "./Radio";
import "./Switch";

declare module '@mui/material' {
  interface Color {
    0?: string;
    A50?: string;
    A800?: string;
  }
}
