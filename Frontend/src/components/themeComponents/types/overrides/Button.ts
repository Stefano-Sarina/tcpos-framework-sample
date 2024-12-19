import * as Button from '@mui/material/Button';


declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    dashed:true;
    shadow:true;
    light:true;
  }

  interface ButtonPropsSizeOverrides {
    extraSmall:true;
  }
}
