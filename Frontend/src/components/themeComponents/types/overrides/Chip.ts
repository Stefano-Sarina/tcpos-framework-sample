// eslint-disable-next-line
import * as Chip from '@mui/material/Chip';

declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    light:true;
    combined:true;
  }
  interface ChipPropsSizeOverrides {
    large:true;
  }
}