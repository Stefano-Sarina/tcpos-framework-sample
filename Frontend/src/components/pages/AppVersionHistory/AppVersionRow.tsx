import React from "react";
import {Box, Typography} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Avatar from '../../themeComponents/@extended/Avatar';
import CheckIcon from "@mui/icons-material/Check";
import {useTheme} from "@mui/material/styles";
import {Link} from 'react-router-dom';

interface IAppVersionRowProps {
    date: string,
    version: string,
    versionDescription: string,
    build: boolean,
    commitId: string
}
export const AppVersionRow = (props: IAppVersionRowProps) => {
    const theme = useTheme();

    return (
            <Box sx={{display: 'flex', flexDirection: 'row', flex: 1, marginTop: '12px', marginBottom: '24px'}}>
                <Box sx={{minWidth: '5rem', marginTop: '8px'}}>
                    <Typography align={"left"} variant={"body1"}
                                color={"secondary"}>
                        {props.date}
                    </Typography>
                </Box>
                <Box sx={{
                    minWidth: '3rem',
                }}>
                    <Avatar color={!props.build ? "info" : "success"}
                            sx={{backgroundColor: theme.palette.background.paper, border: '1px solid'}}
                    >
                        {props.build ? <AccountBalanceIcon/> :
                                <CheckIcon/>}
                    </Avatar>
                </Box>
                <Box sx={{
                    flex: 1, borderLeft: '2px solid #ebebeb',
                    marginLeft: '-30px', paddingLeft: '40px',
                    marginTop: '-18px', paddingTop: '18px',
                    marginBottom: '-18px', paddingBottom: '18px',
                }}>
                    <Box>
                        <Typography component="div" align="left"
                                    variant={!props.build ? "subtitle1" : "h5"}>
                            {`Ver. ${props.version} - ${props.build ? 'Build' : 'Commit'} `}
                        </Typography>
                        <Typography component={'div'} align={'left'} variant={'caption'}>
                            {props.commitId && props.commitId !== "" ?
                                    <a target={'_blank'}
                                       href={'https://dev.azure.com/zucchetti-tcpos/V4/_git/web-frontend/commit/' +
                                               props.commitId}
                                       style={{fontWeight: 'normal'}}>
                                        {`Commit id: ${props.commitId.slice(0, 7)}`}
                                    </a>
                                    : ""}

                        </Typography>
                    </Box>
                    <Box>
                        <Typography color="secondary" align="left"
                                    variant="caption"
                                    style={{overflowWrap: 'break-word'}}>
                            {props.versionDescription}
                        </Typography>
                    </Box>

                </Box>
            </Box>
    );
};