import type {ChangeEvent} from 'react';
import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

// material-ui
import {useTheme} from '@mui/material/styles';
import {Box, FormLabel, Grid, Menu, MenuItem, Stack, TextField, Typography} from '@mui/material';

// project import
import IconButton from '../themeComponents/@extended/IconButton';
import MainCard from '../themeComponents/MainCard';
import ProfileTab from './ProfileTab';
//import { facebookColor, linkedInColor, twitterColor } from 'config';
// assets
import {CameraOutlined, MoreOutlined} from '@ant-design/icons';
import {useAppSelector} from '@tcpos/backoffice-components';

import avatarImage from "../../assets/images/users/default.png";
import Avatar from "../themeComponents/@extended/Avatar";
// const avatarImage = require.context('../../assets/images/users', true);

// ==============================|| USER PROFILE - TAB CONTENT ||============================== //

interface Props {
    focusInput: () => void;
}

const ProfileTabs = ({ focusInput }: Props) => {
    const user = useAppSelector(state => state.user);

    const theme = useTheme();
    const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
    const [avatar, setAvatar] = useState<string | undefined>(avatarImage);

    useEffect(() => {
        if (selectedImage) {
            setAvatar(URL.createObjectURL(selectedImage));
        }
    }, [selectedImage]);

    const [anchorEl, setAnchorEl] = useState<Element | null | undefined>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
        setAnchorEl(event?.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <MainCard>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end">
                        <IconButton
                            variant="light"
                            color="secondary"
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            <MoreOutlined />
                        </IconButton>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button'
                            }}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right'
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                        >
                            <MenuItem
                                component={Link}
                                to="/user/personal"
                                onClick={() => {
                                    handleClose();
                                    setTimeout(() => {
                                        focusInput();
                                    });
                                }}
                            >
                                Edit
                            </MenuItem>
                            <MenuItem onClick={handleClose} disabled>
                                Delete
                            </MenuItem>
                        </Menu>
                    </Stack>
                    <Stack spacing={2.5} alignItems="center">
                        <FormLabel
                            htmlFor="change-avtar"
                            sx={{
                                position: 'relative',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                            }}
                        >
                            <Avatar alt="Avatar 1" src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Stack spacing={0.5} alignItems="center">
                                    <CameraOutlined style={{ color: theme.palette.secondary.light, fontSize: '2rem' }} />
                                    <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                                </Stack>
                            </Box>
                        </FormLabel>
                        <TextField
                            type="file"
                            id="change-avtar"
                            label="Outlined"
                            variant="outlined"
                            sx={{ display: 'none' }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedImage(e.target.files?.[0])}
                        />
                        <Stack spacing={0.5} alignItems="center">
                            <Typography variant="h5">{user.name}</Typography>
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <ProfileTab />
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default ProfileTabs;
