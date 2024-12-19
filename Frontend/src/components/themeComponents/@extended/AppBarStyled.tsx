// material-ui
import {styled} from '@mui/material/styles';
import type {Theme} from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import type {AppBarProps as MuiAppBarProps, AppBarTypeMap} from '@mui/material/AppBar';

// project import
import { drawerWidth } from '../config';
import type {StyledComponent} from "@emotion/styled";
import type {PropsOf} from "@emotion/react";
import type {OverridableComponent} from "@mui/material/OverridableComponent";
import type {MUIStyledCommonProps} from "@mui/system";

// ==============================|| HEADER - APP BAR STYLED ||============================== //

interface Props extends MuiAppBarProps {
  open?: boolean;
}

const AppBarStyled: StyledComponent<PropsOf<OverridableComponent<AppBarTypeMap>> & MUIStyledCommonProps<Theme> & Props, {}, {}> = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })<Props>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(!open && {
    width: `calc(100% - ${theme.spacing(7.5)})`
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

export default AppBarStyled;
