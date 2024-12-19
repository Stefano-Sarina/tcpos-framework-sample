import React, {useMemo} from 'react';

// material-ui
import type {Theme} from '@mui/material/styles';
import {Box, useMediaQuery} from '@mui/material';

// project import
import Search from './Search';
import Message from './Message';
import Profile from './Profile/Profile';
import Localization from './Localization';
import Notification from './Notification';
import MobileSection from './MobileSection';
import {useAppSelector} from "@tcpos/backoffice-components";

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
    const i18n = useAppSelector(state => state.config.languageInfo.lang);

    const matchesXs = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const localization = useMemo(() => <Localization/>, [i18n]);

    return (
            <>
                {!matchesXs && <Search/>}
                {!matchesXs && localization}
                {matchesXs && <Box sx={{width: '100%', ml: 1}}/>}

                {/*<Notification/>
                <Message/>*/}
                {!matchesXs && <Profile/>}
                {matchesXs && <MobileSection/>}
            </>
    );
};

export default HeaderContent;
