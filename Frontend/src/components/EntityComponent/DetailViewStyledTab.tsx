import React from "react";
import {styled} from "@mui/material/styles";
import {Tab} from "@mui/material";

interface StyledTabProps {
    label: React.ReactNode;
}

export const DetailViewStyledTab = styled((props: StyledTabProps) => <Tab style={{textTransform: 'none'}} {...props} />)(({theme}) => ({
    ".tab-with-error": {
        color: theme.palette.error.main,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ".tab-with-error-no-color": {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ".icon-tab-error": {
        color: theme.palette.error.main,
    },
}));