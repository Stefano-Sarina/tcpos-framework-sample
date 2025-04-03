import type {DragLayerMonitorProps, NodeModel} from "@minoru/react-dnd-treeview";
import { WD_TreeContainer} from "@tcpos/backoffice-components";
import type {ITreeData} from "@tcpos/backoffice-components";
import React from "react";
import {Box, Typography} from "@mui/material";
import {rwModes} from "@tcpos/common-core";
import {useIntl} from "react-intl";
import {useTheme} from "@mui/material/styles";

interface UiSimulatorFieldListParams {
    usedFields?: { numberUsed: number | undefined; numberNotUsed: number | undefined };
    treeData: NodeModel<ITreeData>[];
    element: (monitorProps: DragLayerMonitorProps<ITreeData>) => React.JSX.Element;
}

export const UiSimulatorFieldList = (props: UiSimulatorFieldListParams) => {
    const theme = useTheme();
    const intl = useIntl();

    return <>
        <Box sx={{
            m: 1,
            position: "sticky",
            top: 0,
            zIndex: 1200,
            backgroundColor: theme.palette.background.paper,
        }}>
            <Typography variant={"h5"}>
                {`${intl.formatMessage({id: "Main table fields"})} - 
                                                                            ${intl.formatMessage({id: "Used fields"})}: 
                                                                            ${props.usedFields?.numberUsed ?? 0} /
                                                                            ${(props.usedFields?.numberUsed ?? 0) +
                (props.usedFields?.numberNotUsed ?? 0)}`
                }
            </Typography>
        </Box>
        <Box>
            <Typography variant={"body1"}>
                <WD_TreeContainer
                        treeData={props.treeData}
                        initialOpen={"all"}
                        componentName={"fieldList"}
                        bindingGuid={""}
                        groupName={""}
                        label={""}
                        rwMode={rwModes.W}
                        insertDroppableFirst={false}
                        openNodes={[]}
                        closeNodes={[]}
                        triggerOpenNodes={false}
                        triggerCloseNodes={false}
                        triggerOpenAllNodes={false}
                        triggerCloseAllNodes={false}
                        triggerResetOpenNodes={false}
                        dragPreviewRender={(props.element)}
                />
            </Typography>
        </Box>
    </>;
};