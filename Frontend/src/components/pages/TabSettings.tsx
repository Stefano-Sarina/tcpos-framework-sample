import React, { useState } from 'react';

// material-ui
import { Button, List, ListItem, ListItemIcon, ListItemText, Stack, Switch, Typography } from '@mui/material';

// project import
import MainCard from '../themeComponents/MainCard';
import useConfig from '../themeComponents/useConfig';

// assets
/*
import { FileDoneOutlined, MailOutlined, TranslationOutlined } from '@ant-design/icons';
*/
import DarkModeIcon from '@mui/icons-material/DarkMode';
import {useIntl} from "react-intl";

// ==============================|| TAB - SETTINGS ||============================== //

const TabSettings = () => {
    const configContext = useConfig();

    const intl = useIntl();
    const test = () => {
        configContext.onChangeMode('dark');
    };

    const [checked, setChecked] = useState(['usn', 'lc']);

    const handleToggle = (value: string) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        if (value === 'dm') {
            configContext.onChangeMode(configContext.mode === 'dark' ? 'light' : 'dark');
        }
        setChecked(newChecked);
    };

    return (
        <MainCard title={intl.formatMessage({id: "Settings"})}>
            <List sx={{ '& .MuiListItem-root': { p: 2 } }}>
                <ListItem divider>
                    <ListItemIcon sx={{ color: 'primary.main', mr: 2, display: { xs: 'none', sm: 'block' } }}>
                        <DarkModeIcon style={{ fontSize: '1.5rem' }} />
                    </ListItemIcon>
                    <ListItemText
                        id="switch-list-label-dm"
                        primary={<Typography variant="h5">{intl.formatMessage({id: 'Dark mode'})}</Typography>}
                        // secondary="You will be notified when customer order any product"
                    />
                    <Switch
                        edge="end"
                        onChange={handleToggle('dm')}
                        checked={checked.indexOf('dm') !== -1}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-dm'
                        }}
                    />
                </ListItem>
{/*
                <ListItem divider>
                    <ListItemIcon sx={{ color: 'primary.main', mr: 2, display: { xs: 'none', sm: 'block' } }}>
                        <MailOutlined style={{ fontSize: '1.5rem' }} />
                    </ListItemIcon>
                    <ListItemText
                        id="switch-list-label-sen"
                        primary={<Typography variant="h5">Setup Email Notification</Typography>}
                        secondary="Turn on email  notification to get updates through email"
                    />
                    <Switch
                        edge="end"
                        onChange={handleToggle('sen')}
                        checked={checked.indexOf('sen') !== -1}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-sen'
                        }}
                    />
                </ListItem>
                <ListItem divider>
                    <ListItemIcon sx={{ color: 'primary.main', mr: 2, display: { xs: 'none', sm: 'block' } }}>
                        <MailOutlined style={{ fontSize: '1.5rem' }} />
                    </ListItemIcon>
                    <ListItemText
                        id="switch-list-label-usn"
                        primary={<Typography variant="h5">Update System Notification</Typography>}
                        secondary="You will be notified when customer order any product"
                    />
                    <Switch
                        edge="end"
                        onChange={handleToggle('usn')}
                        checked={checked.indexOf('usn') !== -1}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-usn'
                        }}
                    />
                </ListItem>
                <ListItem>
                    <ListItemIcon sx={{ color: 'primary.main', mr: 2, display: { xs: 'none', sm: 'block' } }}>
                        <TranslationOutlined style={{ fontSize: '1.5rem' }} />
                    </ListItemIcon>
                    <ListItemText
                        id="switch-list-label-lc"
                        primary={<Typography variant="h5">Language Change</Typography>}
                        secondary="You will be notified when customer order any product"
                    />
                    <Switch
                        edge="end"
                        onChange={handleToggle('lc')}
                        checked={checked.indexOf('lc') !== -1}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-lc'
                        }}
                    />
                </ListItem>
*/}
            </List>
{/*
            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                <Button variant="outlined" color="secondary">
                    Cancel
                </Button>
                <Button variant="contained">Save</Button>
            </Stack>
*/}
        </MainCard>
    );
};

export default TabSettings;
