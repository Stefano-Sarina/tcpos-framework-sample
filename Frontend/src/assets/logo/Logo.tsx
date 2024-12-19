import React from "react";
import { Link } from 'react-router-dom';
import type { To } from 'history';

// material-ui
import { ButtonBase } from '@mui/material';
import type { SxProps } from '@mui/system';

// project import
import Logo from './LogoMain';
import LogoIcon from './LogoIcon';
import {useIntl} from "react-intl";

// ==============================|| MAIN LOGO ||============================== //

interface Props {
  reverse?: boolean;
  isIcon?: boolean;
  sx?: SxProps;
  to?: To;
}

const LogoSection = ({ reverse, isIcon, sx, to }: Props) => {
  const intl = useIntl();

  return <ButtonBase disableRipple component={Link} to={!to ? intl.locale + "/home" : to} sx={sx}>
    {isIcon ? <LogoIcon /> : <Logo reverse={reverse} />}
  </ButtonBase>;
};

export default LogoSection;
