import type { ComponentClass, FunctionComponent } from 'react';

// material-ui
import type { SvgIconTypeMap } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';

// types
import type { AuthProps } from './auth';
import type { MenuProps } from './menu';
import type { SnackbarProps } from './snackbar';

// ==============================|| ROOT TYPES  ||============================== //

export type RootStateProps = {
  auth: AuthProps;
  menu: MenuProps;
  snackbar: SnackbarProps;
};

export type KeyedObject = {
  [key: string]: string | number | KeyedObject | any;
};

export type OverrideIcon =
  | (OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
      muiName: string;
    })
  | ComponentClass<any>
  | FunctionComponent<any>;

export interface GenericCardProps {
  title?: string;
  primary?: string | number | undefined;
  secondary?: string;
  content?: string;
  image?: string;
  dateTime?: string;
  iconPrimary?: OverrideIcon;
  color?: string;
  size?: string;
}
