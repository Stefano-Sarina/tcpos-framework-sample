import * as Alert from '@mui/material/Alert';
declare module '@mui/material/Alert' {
  interface AlertPropsColorOverrides {
    primary:true;
    secondary:true;
  }
  interface AlertPropsVariantOverrides {
    border:true;
  }
}
