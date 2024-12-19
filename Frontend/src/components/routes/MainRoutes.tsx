import React, {lazy} from 'react';

// project import
import MainLayout from '../layout/MainLayout';
import AuthGuard from '../routes/AuthGuard';
import {SearchResults} from "../pages/SearchResults";
import {EntityContextProvider} from "../EntityComponent/EntityContext";
import {EntityPage} from "../EntityComponent/EntityPage";
import {AppVersionHistory} from "../pages/AppVersionHistory/AppVersionHistory";
import {EntityGridViewUrlWrapper} from "../GridView/EntityGridViewUrlWrapper";
import AfterLoginVerification from "../auth/AfterLoginVerification";
import {PageWrapper} from "../wrappers/PageWrapper";
import {PermissionsManagementCustomPage} from "../pages/Permissions/PermissionsManagementCustomPage";
//import {PermissionsManagementCustomPage} from "../pages/Permissions/PermissionsManagementCustomPage";

// pages routing
/*
const DashboardDefault = Loadable(lazy(() => import('../pages/Dashboard')));
const UserTabPersonal = Loadable(lazy(() => import('../pages/TabPersonal')));
const UserProfile = Loadable(lazy(() => import('../pages/UserProfile')));
const UserTabPassword = Loadable(lazy(() => import('../pages/TabPassword')));
const UserTabSettings = Loadable(lazy(() => import('../pages/TabSettings')));
*/

import DashboardDefault from "../pages/Dashboard";
import UserTabPersonal from "../pages/TabPersonal";
import UserProfile from "../pages/UserProfile";
import UserTabPassword from "../pages/TabPassword";
import UserTabSettings from "../pages/TabSettings";

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout/>,
    children: [

        {
            path: '/',
            element: (
                <AuthGuard>
                    <PageWrapper pageRegistrationName={'dashboard'}>
                        <DashboardDefault/>
                    </PageWrapper>
                </AuthGuard>
            ),
        },
        {
            path: '/:lang',
            element: (
                <AuthGuard>
                    <PageWrapper pageRegistrationName={'dashboard'}>
                        <DashboardDefault/>
                    </PageWrapper>
                </AuthGuard>
            ),
        },
        {
            path: '/:lang/home/*',
            element: (
                <AuthGuard>
                    <PageWrapper pageRegistrationName={'dashboard'}>
                        <DashboardDefault/>
                    </PageWrapper>
                </AuthGuard>
            ),
            /*
                  children: [
                    {
                      path: 'sample-page',
                      element: <SamplePage />
                    }
                  ]
            */
        },
        {
            path: '/:lang/after-login-verification',
            element: <AfterLoginVerification/>
        },
        {
            path: '/:lang/operator',
            element: (
                <AuthGuard>
                    <PageWrapper>
                        <UserProfile/>
                    </PageWrapper>
                </AuthGuard>
            ),
            children: [
                {
                    path: 'personal',
                    element: (
                            <AuthGuard>
                                <PageWrapper>
                                    <UserTabPersonal/>
                                </PageWrapper>
                            </AuthGuard>
                    ),
                },
                /*
                        {
                          path: 'payment',
                          element: <UserTabPayment />
                        },
                */
                {
                    path: 'password',
                    element: (
                            <AuthGuard>
                                <PageWrapper>
                                    <UserTabPassword/>
                                </PageWrapper>
                            </AuthGuard>
                    ),
                },
                {
                    path: 'settings',
                    element: (
                            <AuthGuard>
                                <PageWrapper>
                                    <UserTabSettings/>
                                </PageWrapper>
                            </AuthGuard>
                    ),
                }
            ]

        },
        {
            path: '/:lang/entities/:entityName/list',
            element: (
                <AuthGuard>
                    <PageWrapper>
                            <EntityGridViewUrlWrapper/>
                    </PageWrapper>
                </AuthGuard>
            ),
        },
        {
            path: ":lang/entities/:entityName/detail/:objectId",
            element: <AuthGuard>
                <EntityContextProvider>
                    <PageWrapper>
                        <EntityPage/>
                    </PageWrapper>
                </EntityContextProvider>
            </AuthGuard>

            /*element: <EntityComponentTheme/>*/
        },
        {
            path: ":lang/versionhistory/*",
            element: <AuthGuard>
                        <PageWrapper pageRegistrationName={'versionHistory'}>
                            <AppVersionHistory/>
                        </PageWrapper>
                    </AuthGuard>
        },
        {
            path: ":lang/prmPermissions/*",
            element: <AuthGuard>
                <PageWrapper pageRegistrationName={'prmPermission'}>
                    <PermissionsManagementCustomPage/>
                </PageWrapper>
            </AuthGuard>
        },
        /*
                {
                    path: "entities/:entityName/detail",
                    element: <EntityComponentTheme/>
                },
        */
        {
            path: ":lang/searchResults/:query",
            element: <SearchResults/>
        },
    ]
};

export default MainRoutes;
