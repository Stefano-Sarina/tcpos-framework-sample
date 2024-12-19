// material-ui
import type { Theme} from '@mui/system';
import {styled} from '@mui/system';
import {Box} from '@mui/material';

// ==============================|| DRAWER HEADER - STYLED ||============================== //

interface Props {
  theme: Theme;
  open: boolean;
}

export const DrawerHeaderStyled = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }: Props) => ({
  ...(theme.mixins as any).toolbar,
  display: 'flex',
  alignItems: 'center',
  justifyContent: open ? 'flex-start' : 'center',
  paddingLeft: theme.spacing(open ? 3 : 0)
}));

