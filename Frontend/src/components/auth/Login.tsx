import React, {useMemo} from "react";
import {Stack} from '@mui/material';
import "./login.scss";
import AuthWrapper from './sections/auth/AuthWrapper';
import AuthLogin from './sections/auth/auth-forms/AuthLogin';
import logoImage from '../../assets/images/logo-tcposDaily-login.png';
import logoImageDark from '../../assets/images/logo-tcposDaily_dark1.png';
import logoZucchetti from '../../assets/images/LogoZucchetti1.png';
import {useTheme} from "@mui/material/styles";
import Localization from "../layout/Header/HeaderContent/Localization";
import {LocalePageWrapper} from "../wrappers/LocalePageWrapper";
import {useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";
// ================================|| LOGIN ||================================ //

export const Login = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    //dispatch(setDirtyData(false));
    const i18n = useAppSelector(state => state.config.languageInfo.lang); //current configuration
    const localization = useMemo(() => <Localization/>, [i18n]);

    return (
        <AuthWrapper>
            <LocalePageWrapper>
                <div className={"login-dialog"}>
                    <Stack direction='row' alignItems='center' justifyContent={"space-between"}
                           sx={{mb: {xs: -0.5, sm: 0.5}}}
                           className={"login-header"}
                    >
                        <img className="logo logo-image"
                             src={theme.palette.mode === 'dark' ? logoImageDark : logoImage}
                             alt="TCPos" width="100"
                        />
                        <img src={logoZucchetti}
                             alt="Zucchetti" width="180"
                        />
                        {localization}
                    </Stack>
                    <AuthLogin/>
                </div>
            </LocalePageWrapper>
        </AuthWrapper>
    );
};

export default Login;
