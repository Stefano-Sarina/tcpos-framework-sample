import React from "react";
// material-ui
import { useTheme } from '@mui/material/styles';

// project import
import {DrawerHeaderStyled} from './DrawerHeaderStyled';
import Logo from '../../../../assets/logo/Logo';

// ==============================|| DRAWER HEADER ||============================== //

interface Props {
  open: boolean;
}

const DrawerHeader = ({ open }: Props) => {
  const theme = useTheme();

  return (
    <DrawerHeaderStyled theme={theme} open={open}>
      <Logo isIcon={!open} sx={{ width: open ? 'auto' : 35, height: 35 }} />
    </DrawerHeaderStyled>
  );
};

export default DrawerHeader;
