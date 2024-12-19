import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// material-ui
import { useTheme } from "@mui/material/styles";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

// assets
import { LockOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";
import { useParams } from "react-router";

function getPathIndex(pathname: string) {
    let selectedTab = 0;
    switch (pathname.substring(pathname.lastIndexOf('/') + 1)) {
/*
        case '/apps/profiles/operator/payment':
            selectedTab = 1;
            break;
*/
        case '/password':
            selectedTab = 2;
            break;
        case '/settings':
            selectedTab = 3;
            break;
        case '/personal':
        default:
            selectedTab = 0;
    }
    return selectedTab;
}

// ==============================|| USER PROFILE - TAB ||============================== //

const ProfileTab = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const intl = useIntl();
    const {lang} = useParams();
    const [selectedIndex, setSelectedIndex] = useState(getPathIndex(pathname));
    const handleListItemClick = (index: number, route: string) => {
        console.log(route);
        setSelectedIndex(index);
        navigate('/' + lang + '/' + route);
    };

    useEffect(() => {
        setSelectedIndex(getPathIndex(pathname));
    }, [pathname]);

    return (
        <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.grey[500] } }}>
            <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(0, `/${lang}/operator/personal`)}>
                <ListItemIcon>
                    <UserOutlined />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({id: 'Personal Information'})} />
            </ListItemButton>
{/*
            <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClick(1, '/apps/profiles/operator/payment')}>
                <ListItemIcon>
                    <CreditCardOutlined />
                </ListItemIcon>
                <ListItemText primary="Payment" />
            </ListItemButton>
*/}
            <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(2, `/${lang}/operator/password`)}>
                <ListItemIcon>
                    <LockOutlined />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({id: 'Change Password'})} />
            </ListItemButton>
            <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClick(3, `/${lang}/operator/settings)`)}>
                <ListItemIcon>
                    <SettingOutlined />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({id: 'Settings'})} />
            </ListItemButton>
        </List>
    );
};

export default ProfileTab;
