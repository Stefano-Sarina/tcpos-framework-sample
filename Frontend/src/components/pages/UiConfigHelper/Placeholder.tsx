import React from "react";
import type { NodeModel } from "@minoru/react-dnd-treeview";
import "./Placeholder.css";
import {useTheme} from "@mui/material/styles";

type Props = {
    node: NodeModel;
    depth: number;
};

export const Placeholder: React.FC<Props> = (props) => {
    const theme = useTheme();

    return <div
            className={'placeholder-root'}
            style={{marginLeft: props.depth * 24, backgroundColor: theme.palette.primary.light}}
            data-testid="placeholder"
    ></div>
};
