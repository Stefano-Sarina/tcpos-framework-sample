import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

// material-ui
import {useTheme} from '@mui/material/styles';
import {Box, useMediaQuery} from '@mui/material';

// project import
import Drawer from './Drawer/Drawer';
import Header from './Header/Header';
// types
import type {RootStateProps} from '../themeComponents/types/root';
import useConfig from '../themeComponents/useConfig';
import {openDrawer} from '@tcpos/backoffice-core';
import {MainSection} from "./MainSection";
import {useSelectLang, useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";
import {LanguageDictionary} from "../../core/businessLogic/languages";
import type {I18n} from "../../core/services/intl";

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = (props: any) => {
    const theme = useTheme();
    const matchDownLG = useMediaQuery(theme.breakpoints.down('xl'));

    const {lang} = useParams();
    const navigate = useNavigate();
    const {selectNewLang} = useSelectLang();

    useEffect(() => {
        if (!lang) {
            const newSelectedLang = selectNewLang(
                    Object.keys(LanguageDictionary).map((el) => {return LanguageDictionary[el as I18n].code;}
                        ),lang, navigator.language.substring(0,2));
            navigate(`/${newSelectedLang}/home`);
        }
    }, [lang]);

    const { miniDrawer} = useConfig();
    const dispatch = useAppDispatch();

    const menu = useAppSelector(state => state.menu);
    const {drawerOpen} = menu;

    // drawer toggler
    const [open, setOpen] = useState(!miniDrawer || drawerOpen);
    const handleDrawerToggle = () => {
        setOpen(!open);
        dispatch(openDrawer({drawerOpen: !open}));
    };

    // set media wise responsive drawer
    useEffect(() => {
        if (!miniDrawer) {
            setOpen(!matchDownLG);
            dispatch(openDrawer({drawerOpen: !matchDownLG}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchDownLG]);

    useEffect(() => {
        if (open !== drawerOpen) setOpen(drawerOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawerOpen]);

    return (
            <Box component="main" sx={{display: 'flex', width: '100%'}} >
                <Header open={open} handleDrawerToggle={handleDrawerToggle}/>
                <Drawer open={open} handleDrawerToggle={handleDrawerToggle}/>
                <MainSection/>
            </Box>
    );
};

export default MainLayout;
