import type {IPermissionChildrenStats} from "./IPermissionChildrenStats";
import React, {useContext, useMemo} from "react";
import {FormattedMessage} from "react-intl";
import {Chip} from "@mui/material";
import {PermissionState} from "./PermissionState";
import _ from "underscore";
import {PermissionSelectionContext} from "../PermissionSelectionContext";
import type {DataListGraphNode} from "../DataListGraphNode";
import type {IPermissionData} from "./IPermissionData";
import {getChildrenIDs} from "./GetChildrenIDs";

interface PermissionChildStatsProps {
    data?: undefined | IPermissionChildrenStats,
    headerMode?: boolean,
    dataGraph: undefined | DataListGraphNode<IPermissionData>
}

function ChildStat({value, variant}: { variant: PermissionState, value: number }) {
    //return empty string if no value is passed
    if (!value) return <div></div>;
    return <div className={"stat"}>
        <Chip size={"small"}
              className={`permission-status-comp ${variant}`}
              label={value}></Chip></div>;
}

export function PermissionChildStats({data, headerMode, dataGraph}: PermissionChildStatsProps) {
    const context = useContext(PermissionSelectionContext);

    const selectedChildNum = useMemo(() => {
        if (!dataGraph) return 0;
        const ids = getChildrenIDs(dataGraph.children);
        return _.intersection(ids, context ?? []).length;
    }, [context, dataGraph]);

    if (headerMode) {
        return <div className="nbo-permissionNode-childElementWrapper">
            <div className={"stat"}>
                <span className={"text"}><FormattedMessage id={"Selected"}/></span>
            </div>
            <div className={"stat"}>
                <span className={"text"}><FormattedMessage id={PermissionState.ALLOWED}/></span></div>
            <div className={"stat"}>
                <span className={"text"}><FormattedMessage id={PermissionState.DENIED}/></span></div>
            <div className={"stat"}>
                <span className={"text"}><FormattedMessage id={PermissionState.NOT_SET}/></span></div>


        </div>;
    }

    return <div className="nbo-permissionNode-childElementWrapper">
        <div className={"stat"}>
            {!!dataGraph?.children.length&&<FormattedMessage id={"{value} of {total}"} values={{
                value: selectedChildNum,
                total: data?.total ?? 0
            }}></FormattedMessage>}
        </div>
        <ChildStat value={data?.allowed ?? 0} variant={PermissionState.ALLOWED}/>
        <ChildStat value={data?.denied ?? 0} variant={PermissionState.DENIED}/>
        <ChildStat value={data?.notSet ?? 0} variant={PermissionState.NOT_SET}/>


    </div>;
}