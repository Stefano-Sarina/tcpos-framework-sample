import type {ReactNode} from 'react';
import React, { useMemo} from 'react';

// material-ui
import {useTheme} from '@mui/material/styles';
import type { AppBarProps} from '@mui/material';
import {AppBar, Toolbar, useMediaQuery} from '@mui/material';
import Menu from '@mui/icons-material/Menu';

// project import
import AppBarStyled from '../../themeComponents/@extended/AppBarStyled';
import HeaderContent from './HeaderContent/HeaderContent';
import IconButton from '../../themeComponents/@extended/IconButton';

// assets
//import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

interface Props {
    open: boolean;
    handleDrawerToggle?: () => void;
}

const Header = ({open, handleDrawerToggle}: Props) => {
    const theme = useTheme();
    const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));


    // header content
    const headerContent = useMemo(() => <HeaderContent/>, []);

    const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
    const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

    // common header
    const mainHeader: ReactNode = (
            <Toolbar>
                <IconButton
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        color="secondary"
                        variant="light"
                        sx={{color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor, ml: "auto"}}
                >
                    {/*{!open ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}*/}
                    {!open ? <Menu/> : <Menu/>}
                </IconButton>
                {headerContent}
            </Toolbar>
    );

    // app-bar params
    const appBar: AppBarProps = {
        position: 'fixed',
        color: 'inherit',
        elevation: 0,
        sx: {
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: 1300
            // boxShadow: theme.customShadows.z1
        }
    };

    return (
            <>
                {!matchDownMD ? (
                        <AppBarStyled open={open} {...appBar}>
                            {mainHeader}
                        </AppBarStyled>
                ) : (
                        <AppBar {...appBar}>{mainHeader}</AppBar>
                )}
            </>
    );
};

export default Header;
