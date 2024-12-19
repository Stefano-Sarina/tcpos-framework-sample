import type React from 'react';
import {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';


// types
import type { GuardProps} from '../themeComponents/types/auth';
import {
    setAutoRedirect,
} from '@tcpos/backoffice-core';
import {
    useAppDispatch,
    useAppSelector,
} from '@tcpos/backoffice-components';
import {useParams} from "react-router";

// ==============================|| AUTH GUARD ||============================== //

export const AuthGuard = ({children}: GuardProps):React.ReactElement|null => {
    const isLoggedIn = useAppSelector((state) => state.user.loggedIn);
    const manualLogout = useAppSelector((state) => state.user.manualLogout);
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { lang } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            if (!manualLogout) {
                dispatch(setAutoRedirect({url: location.pathname, qstr: location.search}));
                navigate({
                    pathname: '/' + lang + '/login',
                    search: `?red=1`
                });
            } else {
                dispatch(setAutoRedirect({url: "", qstr: ""}));
                navigate({
                    pathname: '/' + lang + '/login',
                    search: ``
                });
            }
        }
    }, [isLoggedIn, manualLogout, navigate]);

    return lang ? children : null;
};

export default AuthGuard;
