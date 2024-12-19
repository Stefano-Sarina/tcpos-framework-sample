import React from "react";
// material-ui
import type { Theme } from '@mui/material/styles';
import { useMediaQuery, Container, Link, Typography, Stack, Box } from '@mui/material';
import {FormattedMessage} from "react-intl";

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

const AuthFooter = () => {
  const matchDownSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Box sx={{p: 1}} >
      <Stack
        direction={matchDownSM ? 'column' : 'row'}
        justifyContent={matchDownSM ? 'center' : 'space-between'}
        spacing={2}
        textAlign={matchDownSM ? 'center' : 'inherit'}
      >
{/*
        <Typography variant="subtitle2" color="secondary" component="span">
          &copy; {' 2022 - ' + (new Date().getFullYear()).toString() + ' '}
          <Typography component={Link} variant="subtitle2" href="https://tcpos.com/it/home" target="_blank" underline="hover">
              Zucchetti Switzerland SA
          </Typography>
        </Typography>
*/}
{/*
        <Stack direction={matchDownSM ? 'column' : 'row'} spacing={matchDownSM ? 1 : 3} textAlign={matchDownSM ? 'center' : 'inherit'}>
          <Typography
            variant="subtitle2"
            color="secondary"
            component={Link}
            href="https://codedthemes.com"
            target="_blank"
            underline="hover"
          >
            Terms and Conditions
          </Typography>
          <Typography
            variant="subtitle2"
            color="secondary"
            component={Link}
            href="https://codedthemes.com"
            target="_blank"
            underline="hover"
          >
            Privacy Policy
          </Typography>
          <Typography
            variant="subtitle2"
            color="secondary"
            component={Link}
            href="https://codedthemes.com"
            target="_blank"
            underline="hover"
          >
            CA Privacy Notice
          </Typography>
        </Stack>
*/}
      </Stack>
    </Box>
  );
};

export default AuthFooter;
