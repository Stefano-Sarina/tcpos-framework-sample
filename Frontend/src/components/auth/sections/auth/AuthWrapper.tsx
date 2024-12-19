import type {ReactNode} from 'react';
import React from "react";

// material-ui
import {Box} from '@mui/material';

// project import
import AuthFooter from './AuthFooter';
//import logoDark from '../../assets/images/logo-tcposDaily-dark.png';
import AuthCard from './AuthCard';
import zucchettiBg from "../../../../assets/images/ZucchettiBg.png";
// assets
import {useTheme} from '@mui/material/styles';

interface Props {
    children: ReactNode;
}

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = ({children}: Props) => {
    const theme = useTheme();
    return (
            <Box sx={{
                minHeight: '100vh',
                /*background:`url(${theme.palette.mode === 'dark' ? bgDark : bg}) center/cover ${theme.palette.mode === 'dark' ? 'black' : 'white'}`}} className={"auth-wrapper"}*/
                background:`url(${zucchettiBg}) center/cover ${theme.palette.mode === 'dark' ? 'black' : 'white'}`}} className={"auth-wrapper"}
            >


                <div className={"login-dialog"}>
                    <AuthCard>{children}</AuthCard>
                </div>

                <footer>
                    <AuthFooter/>
                </footer>

            </Box>
    )
            ;
};

export default AuthWrapper;
