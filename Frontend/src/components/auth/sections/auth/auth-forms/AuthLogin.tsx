import React, {useEffect} from 'react';
import {Link as RouterLink, useSearchParams} from 'react-router-dom';
import {useNavigate, useParams} from 'react-router';

// material-ui
import {
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    FormHelperText,
    Grid,
    Link,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Typography,
    CircularProgress,
    Box,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    FormGroup,
} from "@mui/material";

// third party
import * as Yup from 'yup';
import {Formik} from 'formik';

// project import
import IconButton from "../../../../themeComponents/@extended/IconButton";
import AnimateButton from '../../../../themeComponents/@extended/AnimateButton';
import type { ILoginConfiguration} from '@tcpos/backoffice-core';
import {store, setInit, setAutoRedirect, NextBOPublicRegistrationContainer, removeAppLoadingState, setDirtyData, ABaseApiController, setUserData, setLogged} from '@tcpos/backoffice-core';
// assets
import {EyeOutlined, EyeInvisibleOutlined, AppstoreFilled} from '@ant-design/icons';

import {useIntl} from "react-intl";
import {useTheme} from "@mui/material/styles";
import logoImage from '../../../../../assets/images/logo-tcposDaily-login.png';
import logoImageDark from '../../../../../assets/images/logo-tcposDaily_dark1.png';
import _ from 'underscore';
import {useAppSelector, useLocaleConfig, useSelectLang} from "@tcpos/backoffice-components";
import type {I18n} from "../../../../../core/services/intl";
import {AUserLogic} from "@tcpos/backoffice-core";
import {LanguageDictionary} from "../../../../../core/businessLogic/languages";

// ============================|| FIREBASE - LOGIN ||============================ //

const AuthLogin = () => {
    const [checked, setChecked] = React.useState(false);
    const [capsWarning, setCapsWarning] = React.useState(false);
    const dispatch = store.dispatch;
    const [urlParams, setUrlParams] = useSearchParams();
    const red: string | null = urlParams.get('red'); // string or undefined
    const err: string | null = urlParams.get('error_description');
    const loginErrors = useAppSelector((state) => state.user.loginErrors);
    const userLogic = NextBOPublicRegistrationContainer.resolve(AUserLogic);

    const [showPassword, setShowPassword] = React.useState(false);

    const [loginProcess, setLoginProcess] = React.useState<boolean>(false);
    const [admin, setAdmin] = React.useState<boolean>(false);


    const intl = useIntl();
    const theme = useTheme();
    const navigate = useNavigate();
    const loginConfiguration: ILoginConfiguration = useAppSelector((state) =>
            state.interfaceConfig.loginConfiguration);

    const { lang } = useParams();

    /*
    const localeConfig = useLocaleConfig();
    useEffect(() => {
        localeConfig.changeLanguage(lang as I18n);
    }, [lang]);
    */

    useEffect(() => {
        userLogic.logout();
        dispatch(setInit(false));
        dispatch(removeAppLoadingState())
        if (!red && red !== '1') {
            dispatch(setAutoRedirect({url: "", qstr: ""}));
        }
    }, []);

    const {selectNewLang} = useSelectLang();

    useEffect(() => {
        // validate lang and update cookie (if valid, otherwise an error is thrown)
        const newLang = selectNewLang(Object.keys(LanguageDictionary).map((el) => 
            {return LanguageDictionary[el as I18n].code;}), lang);
        navigate(location.pathname.replace(location.pathname.split("/")[1], newLang) + location.search);
    }, [lang]);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.SyntheticEvent) => {
        event.preventDefault();
    };
    const apiUrl = useAppSelector(state => state.interfaceConfig.apiUrl);

    const onKeyDown = (keyEvent: any) => {
        if (keyEvent.getModifierState('CapsLock')) {
            setCapsWarning(true);
        } else {
            setCapsWarning(false);
        }
    };

    return (
            <>
                <Formik
                        initialValues={{
                            username: '',
                            password: '',
                            submit: null
                        }}
                        validationSchema={Yup.object().shape({
                            //email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                            username: Yup.string().max(255).required(intl.formatMessage({id: "Username is required"})),
                            password: Yup.string().max(255).required(intl.formatMessage({id: "Password is required"}))
                        })}
                        onSubmit={async (values, {setErrors, setStatus, setSubmitting}) => {
                            //navigate(`/${lang}/home`);
                            const response = await NextBOPublicRegistrationContainer.resolve(ABaseApiController)
                                .apiPost(`/api/login?isAdmin=${admin ? 'true' : 'false'}`, {});
                            dispatch(setUserData(admin ? "Admin" : "Not admin")); // TODO refactor setUserData and  add user data (is admin)
                            //window.location.href = `/${lang}/home`;
                            window.location.href = `/${lang}/after-login-verification`;
                            //if ((response as Record<string, unknown>).status === 201) {
                            //}
                            /* fetch("/api/login?isAdmin=true", {
                                method: 'POST',
                                //body: formData.toString(),
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                //redirect: 'follow'
                            }).then(response => {
                                if (response.status === 201) {
                                    window.location.href = `/${lang}/home`;
                                }
                            }).catch(error => {
                                setLoginProcess(false);
                                navigate(`/${lang}/login?err=Login error` + (red && red === '1' ? "&red=1" : ""));
                            }); */
/*                             setLoginProcess(true);
                            const formData = new URLSearchParams();
                            formData.append("username", values.username);
                            formData.append("password", values.password);
                            formData.append("client_id", "tcpos.daily");
                            formData.append("redirect_uri", window.location.origin + "/callback/login/local");
                            formData.append("response_type", "code");
                            formData.append("scope", "openid profile KumoAPI");
                            formData.append("returnUrl", `/${lang}/after-login-verification`);
                            fetch("/connect/authorize", {
                                method: 'POST',
                                body: formData.toString(),
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                redirect: 'follow'
                            }).then(response => {
                                if (response.redirected) {
                                    window.location.href = response.url.replace(`/login`, `/${lang}/login`);
                                }
                            }).catch(error => {
                                setLoginProcess(false);
                                navigate(`/${lang}/login?err=Login error` + (red && red === '1' ? "&red=1" : ""));
                            });
 */

/*
                                        try {
                                          const userLogic = NextBOPublicRegistrationContainer.resolveIUserLogic();
                                          await userLogic.login(values.username, values.password);
                                        } catch (err: any) {
                                          console.error(err);
                                          setStatus({ success: false });
                                          setErrors({
                                              submit: "Auth error"
/!*
                                            submit: err.message ??
                                              loginErrors?.error + " " + loginErrors?.error_description
*!/
                                          });
                                          setSubmitting(false);
                                        }
                                      }
*/

                        }}
                >
                    {({errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values}) => (
                            <form noValidate onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    {err && err !== "" &&
                                            <Grid item xs={12}>
                                                <Stack spacing={1}>
                                                        <Typography data-testid={"loginGenericErrorMessage"} style={{color: theme.palette.error.light}}>
                                                        {err}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                    }
                                    {loginProcess &&
                                            <Grid item xs={12}>
                                                <CircularProgress
                                                        size={20}
                                                        color={'info'}
                                                        sx={{marginRight: '20px'}}
                                                />
                                                {intl.formatMessage({id: "Please wait"})}...
{/*
                                                <Stack spacing={1}>
                                                </Stack>
*/}
                                            </Grid>
                                    }
                                    {loginConfiguration.simpleLogin &&
                                            <>
                                                <Grid item xs={12}>
                                                    <Stack spacing={1}>
                                                        <InputLabel htmlFor="username-login">{intl.formatMessage({id: "Username"})}</InputLabel>
                                                        <OutlinedInput
                                                                id="username-login"
                                                                type="username"
                                                                value={values.username}
                                                                name="username"
                                                                onBlur={handleBlur}
                                                                onChange={handleChange}
                                                                placeholder={intl.formatMessage({id: "Enter username"})}
                                                                fullWidth
                                                                error={Boolean(touched.username && errors.username)}
                                                        />
                                                        {touched.username && errors.username && (
                                                                <FormHelperText error id="standard-weight-helper-text-email-login">
                                                                    {errors.username}
                                                                </FormHelperText>
                                                        )}
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Stack spacing={1}>
                                                        <InputLabel htmlFor="password-login">{intl.formatMessage({id: "Password"})}</InputLabel>
                                                        <OutlinedInput
                                                                fullWidth
                                                                color={capsWarning ? 'warning' : 'primary'}
                                                                error={Boolean(touched.password && errors.password)}
                                                                id="-password-login"
                                                                type={showPassword ? 'text' : 'password'}
                                                                value={values.password}
                                                                name="password"
                                                                onBlur={(event: React.FocusEvent<any, Element>) => {
                                                                    setCapsWarning(false);
                                                                    handleBlur(event);
                                                                }}
                                                                onKeyDown={onKeyDown}
                                                                onChange={handleChange}
                                                                endAdornment={
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                                onClick={handleClickShowPassword}
                                                                                onMouseDown={handleMouseDownPassword}
                                                                                edge="end"
                                                                                color="secondary"
                                                                        >
                                                                            {showPassword ? <EyeOutlined/> :
                                                                                    <EyeInvisibleOutlined/>}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                }
                                                                placeholder={intl.formatMessage({id: "Enter password"})}
                                                        />
                                                        {capsWarning && (
                                                                <Typography variant="caption" sx={{color: 'warning.main'}}
                                                                            id="warning-helper-text-password-login">
                                                                    {intl.formatMessage({id: "Caps lock on"})}!
                                                                </Typography>
                                                        )}
                                                        {touched.password && errors.password && (
                                                                <FormHelperText error
                                                                                id="standard-weight-helper-text-password-login">
                                                                    {errors.password}
                                                                </FormHelperText>
                                                        )}
                                                    </Stack>
                                                </Grid>
                                            </>
                                    }

{/*
                                    <Grid item xs={12} sx={{mt: -1}}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center"
                                               spacing={2}>
                                            <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                                checked={checked}
                                                                onChange={(event) => setChecked(event.target.checked)}
                                                                name="checked"
                                                                color="primary"
                                                                size="small"
                                                        />
                                                    }
                                                    label={<Typography variant="h6">
                                                            {intl.formatMessage({id: "Keep me sign in"})}
                                                        </Typography>}
                                            />
                                            <Link
                                                    variant="h6"
                                                    component={RouterLink}
                                                    to=""
                                                    color="text.primary"
                                            >
                                                {intl.formatMessage({id: "Forgot Password"})}?
                                            </Link>
                                        </Stack>
                                    </Grid>
*/}
                                    {errors.submit && (
                                            <Grid item xs={12}>
                                                <FormHelperText error>{errors.submit}</FormHelperText>
                                            </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormControlLabel control={<Checkbox 
                                                value={admin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdmin(e.target.checked)}
                                            />} name='IsAdmin'  label="Admin" />
                                        </FormGroup>                                    
                                    </Grid>
                                    {loginConfiguration.simpleLogin &&
                                            <Grid item xs={12}>
                                                <AnimateButton>
                                                    <Button id={'login-button'} disableElevation
                                                            fullWidth size="large" type="submit" variant="outlined"
                                                            color="primary"
                                                            disabled={loginProcess}
                                                    >
                                                        {intl.formatMessage({id: "Login"})}
                                                    </Button>
                                                </AnimateButton>
                                            </Grid>
                                    }
                                    {_.values(_.mapObject(loginConfiguration, (val: boolean, key: string) => {
                                            return key !== "simpleLogin" && val ? 1 : 0;
                                        })).reduce((prev: number, curr: number) => {return prev + curr;}, 0) > 0 ?
                                            <Grid item xs={12}>
                                                <Divider>
                                                    <Typography variant="caption">
                                                        {intl.formatMessage({id: "Login with"})}
                                                    </Typography>
                                                </Divider>
                                            </Grid>
                                            :
                                            null
                                    }
                                    {loginConfiguration.loginWithTcPos &&
                                            <Grid item xs={12}>
                                                <AnimateButton>
                                                    <Button startIcon={
                                                        <img className="logo logo-image"  style={{marginBottom: '-17px'}}  src={theme.palette.mode === 'dark' ? logoImageDark : logoImage} alt="TCPos" width="60" />
                                                    } id={'loginTCPOS-button'}
                                                            disableElevation disabled={loginProcess}
                                                            fullWidth size="large" type="submit" variant="outlined"
                                                            color="primary"
                                                            onClick={() => {setLoginProcess(true);}}
                                                            href={`/connect/authorize?client_id=tcpos.daily&redirect_uri=${window.location.origin}/callback/login/local&response_type=code&scope=openid profile KumoAPI&returnUrl=${window.location.origin}/${lang}/after-login-verification`}>
                                                    </Button>
                                                </AnimateButton>
                                            </Grid>
                                    }
                                    {loginConfiguration.loginWithMicrosoft &&
                                            <Grid item xs={12}>
                                                <AnimateButton>
                                                    <Button startIcon={<AppstoreFilled/>} id={'loginMicrosoft-button'}
                                                            disableElevation disabled={loginProcess}
                                                            fullWidth size="large" type="submit" variant="outlined"
                                                            style={{margin: 'auto'}}
                                                            color="primary"
                                                            onClick={() => {setLoginProcess(true);}}
                                                            href={`/connect/authorize?client_id=tcpos.daily&redirect_uri=${window.location.origin}/callback/login/microsoft&response_type=code&scope=openid profile KumoAPI&returnUrl=${window.location.origin}/${lang}/after-login-verification&identity_provider=Microsoft`}>
                                                        Microsoft
                                                    </Button>
                                                </AnimateButton>
                                            </Grid>
                                    }
                                    {loginConfiguration.loginWithGoogle &&
                                            <Grid item xs={12}>
                                                <AnimateButton>
                                                    <Button id={'loginMicrosoft-button'}
                                                            disableElevation disabled={loginProcess}
                                                            fullWidth size="large" type="submit" variant="outlined"
                                                            style={{margin: 'auto'}}
                                                            color="primary"
                                                            onClick={() => {setLoginProcess(true);}}
                                                            href={`/connect/authorize?client_id=tcpos.daily&redirect_uri=${window.location.origin}/callback/login/google&response_type=code&scope=openid profile KumoAPI&returnUrl=${window.location.origin}/after-login-verification&identity_provider=Google`}>
                                                        Google
                                                    </Button>
                                                </AnimateButton>
                                            </Grid>
                                    }
                                </Grid>
                            </form>
                    )}
                </Formik>
            </>
    );
};

export default AuthLogin;
