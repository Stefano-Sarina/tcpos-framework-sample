
import type {Theme} from '@mui/material';

// project import
import type {CustomShadowProps} from '../theme';

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadowProps;
  }
}
