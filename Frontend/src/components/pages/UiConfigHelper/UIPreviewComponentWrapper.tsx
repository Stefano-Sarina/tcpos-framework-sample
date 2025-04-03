import React from "react";
import type {IUIPreviewComponentWrapperProps} from "./IUIPreviewComponentProps";
import {UIPreviewComponent} from "./UIPreviewComponent";
import {Box, Typography} from "@mui/material";
import {useIntl} from "react-intl";

export const UIPreviewComponentWrapper = (props: IUIPreviewComponentWrapperProps) => {
    const intl = useIntl();
    return props.error === ""
            ? <UIPreviewComponent {...props} />
            : <Box sx={{m: 2}}>
                <Typography component="div" variant="h6" color={"error"}>
                    {`${intl.formatMessage({id: 'Errors'})}:`}
                </Typography>
                {props.error.split(" - ").filter(err => err !== "")
                        .map(err => (<Typography component="div" variant="body1" color={"error"}>
                        {`- ${err}`}
                    </Typography>))}
            </Box>
    ;
};