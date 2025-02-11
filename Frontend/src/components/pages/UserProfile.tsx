import { useRef } from 'react';
import React from "react";
// import "./profile.scss";
// material-ui
import { Grid } from '@mui/material';
import { Outlet } from 'react-router';

// project import
import ProfileTabs from './ProfileTabs';

// ==============================|| PROFILE - USER ||============================== //

const UserProfile = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    return (
        <Grid container spacing={3}>
{/*
            <Grid item xs={12} md={3}>
                <ProfileTabs focusInput={focusInput}  />
            </Grid>
*/}
            <Grid item xs={12} md={12}>
                <Outlet context={inputRef} />
            </Grid>
        </Grid>
    );
};

export default UserProfile;
