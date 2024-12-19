import React from "react";
import {Box, Container, Toolbar} from '@mui/material';
import useConfig from "../themeComponents/useConfig";
import Footer from "./Footer";
import {Outlet} from 'react-router-dom';
import classnames from "classnames";

export const MainSection = (props: any): JSX.Element => {

    const {container, miniDrawer} = useConfig();

    return (
            /*Original <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>*/
            <Box component="main" className={classnames("main-section")} sx={{
                width: '100% - 260px',
                flexGrow: 1,
                pt: {xs: 2, sm: 3},
                pl: {xs: 2, sm: 1},
                pr: {xs: 2, sm: 1},
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Toolbar/>
                {container && (
                        <Container
                                className={"main-container-root"}
                                maxWidth={'xl' }
                                /*maxWidth={false}*/
                                sx={{
                                    px: {xs: 0, sm: 2}, position: 'relative',
                                    minHeight: 'calc(100vh - 160px)', // Original version: 110px instead of 160px
                                    display: 'flex', flexDirection: 'column',
                                    flex: 1,
                                }}
                        >
                            {/*<Breadcrumbs navigation={menuItems} title titleBottom card={false} divider={false}/>*/}
                            <Outlet/>
                        </Container>
                )}
                {!container && (
                        <Box sx={{
                            position: 'relative',
                            minHeight: 'calc(100vh - 110px)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/*<Breadcrumbs navigation={menuItems} title titleBottom card={false} divider={false}/>*/}
                            <Outlet/>
                        </Box>
                )}
                <Footer/>
            </Box>
    );
};