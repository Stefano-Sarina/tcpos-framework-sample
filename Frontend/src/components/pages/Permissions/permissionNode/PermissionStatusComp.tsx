import {PermissionState} from "./PermissionState";
import React, {type ReactNode} from "react";
import {Chip, Tooltip} from "@mui/material";
import {FormattedMessage, useIntl} from "react-intl";
import classnames from "classnames";

import "./permissionStatusComp.scss";
import {TCIcon} from "@tcpos/common-components";
import _ from "underscore";

interface PermissionStatusProps {
    variant?: PermissionState
    inherit?: string
    inheritType?: PermissionState
}

const messages: Record<PermissionState, ReactNode> = {
    [PermissionState.ALLOWED]: <FormattedMessage id={"Allowed"}/>,
    [PermissionState.DENIED]: <FormattedMessage id={"Denied"}/>,
    [PermissionState.NOT_SET]: <FormattedMessage id={"Not set"}/>,
} as const;

export const PermissionStatusComp = ({variant, inherit, inheritType}: PermissionStatusProps) => {
    const intl = useIntl();

    return <>
        {variant && (inherit && inheritType && inherit !== "" ?
            <Tooltip title={<>
                {messages[inheritType]}
                {` - ${intl.formatMessage({id: 'inherited from group'})} ${inherit}`}
                </>}
            >
                <div>
                    <TCIcon iconCode={'tci-sort-bool-ascending-variant'}
                            className={classnames("permission-status-comp", inheritType, "permission-status-comp-icon")}
                            sx={{maxWidth: 1}}
                    />
                </div>
            </Tooltip>
            : <div className={"permission-status-comp-icon"}> </div>)
        }
        <Chip
            size={"small"}
            className={classnames("permission-status-comp", variant)}
            label={variant && messages[variant]}
            >
        </Chip>

        </>;
};