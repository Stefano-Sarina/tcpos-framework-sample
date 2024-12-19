import React, {lazy} from 'react';
import {PageWrapper} from "../wrappers/PageWrapper";

// project import
import CommonLayout from '../themeComponents/CommonLayout';

// render - login
//const AuthLogin = Loadable(lazy(() => import('../auth/Login')));
import AuthLogin from "../auth/Login";

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = [
    {
        path: '/:lang/login',
        element: <PageWrapper><CommonLayout /></PageWrapper>,
        children: [
            {
                path: '/:lang/login',
                element: <AuthLogin />
            },
        ]
    }
];

export default LoginRoutes;
