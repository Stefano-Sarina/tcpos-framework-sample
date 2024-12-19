import type {ReactNode} from 'react';
import React, {useRef, useState} from 'react';

// material-ui
import {useTheme} from '@mui/material/styles';
import {
    Box,
    ButtonBase,
    CardContent,
    ClickAwayListener,
    Grid,
    Paper,
    Popper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';

// project import
import Avatar from "../../../../themeComponents/@extended/Avatar";
import IconButton from "../../../../themeComponents/@extended/IconButton";
import MainCard from "../../../../themeComponents/MainCard";
import Transitions from "../../../../themeComponents/@extended/Transitions";
//import useAuth from 'hooks/useAuth';
import ProfileTab from './ProfileTab';
//import SettingTab from './SettingTab';
// assets
import avatar1 from '../../../../../assets/images/users/avatar-1.png';
import {LogoutOutlined} from '@ant-design/icons';
import {DailyPublicRegistrationContainer} from '@tcpos/backoffice-core';
import {useAppSelector} from '@tcpos/backoffice-components';
import {useNavigate} from "react-router-dom";
import {useIntl} from "react-intl";
import {AUserLogic} from "@tcpos/backoffice-core";


// types
interface TabPanelProps {
    children?: ReactNode;
    dir?: string;
    index: number;
    value: number;
}

// tab panel wrapper
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div role='tabpanel' hidden={value !== index} id={`profile-tabpanel-${index}`}
             aria-labelledby={`profile-tab-${index}`} {...other}>
            {value === index && children}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `profile-tab-${index}`,
        'aria-controls': `profile-tabpanel-${index}`
    };
}

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const Profile = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    //const { logout, operator } = useAuth();
    const user = useAppSelector(state => state.user);
    const userLogic = DailyPublicRegistrationContainer.resolve(AUserLogic);
    const intl = useIntl();

    const handleLogout = async () => {
        try {
            //await userLogic.logout();
            navigate(`/${intl.locale}/login`);
        } catch (err) {
            console.error(err);
        }
    };

    const anchorRef = useRef<any>(null);
    const [open, setOpen] = useState(false);
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleClick = () => {
        setOpen(false);
    };

    const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
    // TODO Replicated code from WDLinkWrapper: replace menu items and onClick method with WDLinkWrapper


    return (
        <>
            <Box sx={{ flexShrink: 0, ml: 0.75 }}>
                <ButtonBase
                    sx={{
                        p: 0.25,
                        bgcolor: open ? iconBackColorOpen : 'transparent',
                        borderRadius: 1,
                        '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'secondary.light' : 'secondary.lighter' },
                        '&:focus-visible': {
                            outline: `2px solid ${theme.palette.secondary.dark}`,
                            outlineOffset: 2
                        }
                    }}
                    aria-label='open profile'
                    ref={anchorRef}
                    aria-controls={open ? 'profile-grow' : undefined}
                    aria-haspopup='true'
                    onClick={handleToggle}
                    data-testid={'HeaderToolbarProfileButton'}
                >
                    <Stack direction='row' spacing={2} alignItems='center' sx={{ p: 0.5 }}>
                        <Avatar alt='profile user' src={avatar1} size='xs' />
                        {/*<Typography variant='subtitle1'>{operator?.name}</Typography>*/}
                    </Stack>
                </ButtonBase>
                <Popper
                    placement='bottom-end'
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                    popperOptions={{
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [0, 9]
                                }
                            }
                        ]
                    }}
                >
                    {({ TransitionProps }) => (
                        <Transitions type='fade' in={open} {...TransitionProps}>
                            {open && (
                                <Paper
                                    sx={{
                                        boxShadow: theme.customShadows.z1,
                                        width: 290,
                                        minWidth: 240,
                                        maxWidth: 290,
                                        [theme.breakpoints.down('md')]: {
                                            maxWidth: 250
                                        }
                                    }}
                                >
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MainCard elevation={0} border={false} content={false}>
                                            <CardContent sx={{ px: 2.5, pt: 3 }}>
                                                <Grid container justifyContent='space-between' alignItems='center'>
                                                    <Grid item>
                                                        <Stack direction='row' spacing={1.25} alignItems='center'>
                                                            <Avatar alt='profile user' src={avatar1}
                                                                    sx={{ width: 32, height: 32 }} />
                                                            <Stack>
                                                                <Typography variant='h6'>{user?.name}</Typography>
                                                                <Typography variant='body2' color='textSecondary'>
                                                                    {/*UI/UX Designer*/}
                                                                </Typography>
                                                            </Stack>
                                                        </Stack>
                                                    </Grid>
                                                    <Grid item>
                                                        <Tooltip title={intl.formatMessage({id: 'Logout'})}>
                                                            <IconButton size='large' sx={{ color: 'text.primary' }}
                                                                        onClick={handleLogout} data-testid={'HeaderToolbarProfileMenuLogoutButton'}>
                                                                <LogoutOutlined />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            {open && (
                                                <>
                                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                        <ProfileTab
                                                            handleLogout={handleLogout}
                                                            handleClick={handleClick}
                                                        />
    {/*
                                                        <Tabs variant='fullWidth' value={value} onChange={handleChange}
                                                              aria-label='profile tabs'>
                                                            <Tab
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    textTransform: 'capitalize'
                                                                }}
                                                                icon={<UserOutlined
                                                                    style={{ marginBottom: 0, marginRight: '10px' }} />}
                                                                label='Profile'
                                                                {...a11yProps(0)}
                                                            />
                                                            <Tab
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    textTransform: 'capitalize'
                                                                }}
                                                                icon={<SettingOutlined
                                                                    style={{ marginBottom: 0, marginRight: '10px' }} />}
                                                                label='Setting'
                                                                {...a11yProps(1)}
                                                            />
                                                        </Tabs>
    */}
                                                    </Box>
    {/*
                                                    <TabPanel value={value} index={0} dir={theme.direction}>
                                                        <ProfileTab handleLogout={handleLogout} />
                                                    </TabPanel>
                                                    <TabPanel value={value} index={1} dir={theme.direction}>
                                                        <SettingTab />
                                                    </TabPanel>
    */}
                                                </>
                                            )}
                                        </MainCard>
                                    </ClickAwayListener>
                                </Paper>
                            )}
                        </Transitions>
                    )}
                </Popper>
            </Box>
        </>
    );
};

export default Profile;
