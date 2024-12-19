import React, {useState} from 'react';

// material-ui
import {List, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';

// assets
import {LogoutOutlined, UserOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {useIntl} from "react-intl";
import {useAppSelector} from "@tcpos/backoffice-components";

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

interface Props {
    handleLogout: () => void;
    handleClick: () => void;
}

const ProfileTab = ({ handleLogout, handleClick }: Props) => {
    const navigate = useNavigate();
    const intl = useIntl();
    const dirtyData = useAppSelector(state => state.appState.dirtyData);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
        handleClick();
        setSelectedIndex(index);
        switch (index) {
            case 0:
                navigate(`${intl.locale}/operator/personal`);
                break;
            case 1:
                navigate(`${intl.locale}/operator/personal`);
                break;
            case 2:
                navigate(`${intl.locale}/operator/settings`);
                break;
            default:
                break;
        }
    };

    return (<>
        <List component='nav' sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
{/*
            <ListItemButton
                            onClick={(event: React.MouseEvent<HTMLDivElement>) => handleListItemClick(event, 0)}>
                <ListItemIcon>
                    <EditOutlined />
                </ListItemIcon>
                <ListItemText primary='Edit Profile' />
            </ListItemButton>
*/}
{/*
            <ListItemButton
                            onClick={(event: React.MouseEvent<HTMLDivElement>) => handleListItemClick(event, 1)}>
                <ListItemIcon>
                    <UserOutlined />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({id: 'Profile'})} />
            </ListItemButton>
*/}
            <ListItemButton
                            onClick={(event: React.MouseEvent<HTMLDivElement>) => handleListItemClick(event, 2)}>
                <ListItemIcon>
                    <UserOutlined />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({id: 'Account settings'})} />
            </ListItemButton>

            <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                    <LogoutOutlined />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({id: 'Logout'})} />
            </ListItemButton>
        </List>
        </>
    );
};

export default ProfileTab;
