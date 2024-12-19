import React from "react";
// material-ui
import type { Theme } from '@mui/material/styles';
import {Box, Link, Paper, Typography} from '@mui/material';

// project import

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

const AuthCard = ({ children, ...other }: any) => (
    <Paper
        sx={{
            maxWidth: { xs: 400, lg: /*475*/ 510 },
            margin: { xs: 2.5, md: 3 },
            "& > *": {
                flexGrow: 1,
                flexBasis: "50%",
            },
        }}
        elevation={4}
        {...other}
    >
        <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>{children}</Box>
        <Box sx={{ pb: "16px" }}>
            <Typography
                variant="subtitle2"
                color="secondary"
                component="span"
                sx={{ textAlign: "center", display: "block" }}
            >
                &copy; {" 2022 - " + new Date().getFullYear().toString() + " "}
                <Typography
                    component={Link}
                    variant="subtitle2"
                    href="https://tcpos.com/it/home"
                    target="_blank"
                    underline="hover"
                >
                    Zucchetti Switzerland SA
                </Typography>
            </Typography>
        </Box>
    </Paper>
);

export default AuthCard;
