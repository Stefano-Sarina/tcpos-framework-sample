import React, {useEffect, useState} from "react";
import {Link as RouterLink} from 'react-router-dom';
import {FormattedMessage, useIntl} from 'react-intl';
// material-ui
import {Link, Paper, Stack, Typography, useMediaQuery} from '@mui/material';
import {useTheme} from "@mui/material/styles";
import {ANextBOConfigService, NextBOPublicRegistrationContainer} from "@tcpos/backoffice-core";
import {useAppSelector} from "@tcpos/backoffice-components";

declare const VERSION: string;

const Footer = () => {
    const theme = useTheme();
    const matchDownXS = useMediaQuery(theme.breakpoints.down('sm'));
    const [versionInfo, setVersionInfo] = useState<string>("");

    const intl = useIntl();

    const appName = useAppSelector(state => state.interfaceConfig.applicationName);
    const getVersionInfo = async () => {
        const res = await NextBOPublicRegistrationContainer.resolve(ANextBOConfigService).getVersionHistory();
        setVersionInfo(res[0] ?
                res[0].version + ' ' + res[0].date.replace(/-/g,'')
                : "");
    };

    useEffect(() => {
        getVersionInfo();
    }, []);

    return (
        <Paper
            className={"Main-footer"}
            sx={{
                pt: 0.5,
                pb: 0.5,
                //opposite of mainsection
                ml: { xs: -2, sm: -1 },
                mr: { xs: -2, sm: -1 },
                pl: { xs: 2, sm: 3 },
                pr: { xs: 2, sm: 3 },
                borderRadius: 0,
                zIndex: "fab",
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant={"h6"}>
                    {`${!matchDownXS ? "TCPOS " + appName + " v." : "V."} `}
                    <Link
                        component={RouterLink}
                        to={`/${intl.locale}/versionhistory`}
                        variant="h6"
                        id={"footerVersionNumber"}
                    >
                        {versionInfo}
                    </Link>
                </Typography>
                <Typography variant="caption">
                    &copy;
                    {"2022 - " + new Date().getFullYear().toString() + " "}
                    <a href={"https://tcpos.com/it/home"} target={"_blank"}>
                        Zucchetti Switzerland SA
                    </a>
                    {" - "}
                    {!matchDownXS ? <FormattedMessage id={"All rights reserved"} /> : null}
                </Typography>
            </Stack>
        </Paper>
    );
};

export default Footer;
