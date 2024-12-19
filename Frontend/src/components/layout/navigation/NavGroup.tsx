// types
import type {ComponentClass, FunctionComponent, ReactNode} from "react";
import React from "react";

// material-ui
import {useTheme} from '@mui/material/styles';
import {Box, type ChipProps, List, type SvgIconTypeMap, Typography} from '@mui/material';

// project import
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import type {OverridableComponent} from "@mui/material/OverridableComponent";
import {useAppSelector} from "@tcpos/backoffice-components";

// ==============================|| MENU TYPES  ||============================== //

export type NavItemType = {
    breadcrumbs?: boolean;
    caption?: ReactNode | string;
    children?: NavItemType[];
    chip?: ChipProps;
    color?: 'primary' | 'secondary' | 'default' | undefined;
    disabled?: boolean;
    external?: boolean;
    icon?: GenericCardProps['iconPrimary'];
    id?: string;
    search?: string;
    target?: boolean;
    title?: ReactNode | string;
    type?: string;
    url?: string | undefined;
};

export type MenuProps = {
    openItem: string[];
    openComponent: string;
    drawerOpen: boolean;
    componentDrawerOpen: boolean;
};

// ==============================|| ROOT TYPES  ||============================== //

export type RootStateProps = {
    menu: MenuProps;
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

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

interface Props {
    item: NavItemType;
}

const NavGroup = ({ item }: Props) => {
    const theme = useTheme();
    const menu = useAppSelector(state => state.menu);
    const { drawerOpen } = menu;

    const navCollapse = item.children?.map((menuItem) => {
        switch (menuItem.type) {
            case 'collapse':
                return <NavCollapse key={menuItem.id} menu={menuItem} level={1} />;
            case 'item':
                return <NavItem key={menuItem.id} item={menuItem} level={1} />;
            default:
                return (
                    <Typography key={menuItem.id} variant="h6" color="error" align="center">
                        Fix - Group Collapse or Items
                    </Typography>
                );
        }
    });

    return (
        <List
            subheader={
                item.title &&
                drawerOpen && (
                    <Box sx={{ pl: 3, mb: 1.5 }}>
                        <Typography variant="subtitle2" color={theme.palette.mode === 'dark' ? 'textSecondary' : 'text.secondary'}>
                            {item.title}
                        </Typography>
                        {item.caption && (
                            <Typography variant="caption" color="secondary">
                                {item.caption}
                            </Typography>
                        )}
                    </Box>
                )
            }
            sx={{ mt: drawerOpen && item.title ? 1.5 : 0, py: 0, zIndex: 0 }}
        >
            {navCollapse}
        </List>
    );
};

export default NavGroup;
