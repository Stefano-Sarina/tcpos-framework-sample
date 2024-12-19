// eslint-disable-next-line
import * as Pagination from '@mui/material/Pagination';

declare module '@mui/material/Pagination' {
  interface PaginationPropsColorOverrides {
    error:true;
    success:true;
    warning:true;
    info:true;
  }
  interface PaginationPropsVariantOverrides {
    contained:true;
    combined:true;
  }
}
