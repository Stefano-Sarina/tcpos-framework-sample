import {
    Autocomplete,
    Box,
    Button, Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControlLabel,
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {useIntl} from "react-intl";
import type {ISetEntityDialogProps} from "./ISetEntityDialogProps";

export const SetEntityDialog = (props: ISetEntityDialogProps) => {
    const theme = useTheme();
    const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
    const intl = useIntl();

    const [value, setValue] = React.useState<string>("");
    const [addSubFields, setAddSubFields] = useState<boolean>(false);
    const [localError, setLocalError] = useState<string>("");

    const onAddSubFieldsChange = (e:  React.ChangeEvent<HTMLInputElement>) => {
        setAddSubFields(e.target.checked);
    };

    const onOk = () => {
        if (value && value !== "") {
            props.onOk(value, props.nodeId, addSubFields);
        } else {
            setLocalError(intl.formatMessage({id: "Entity name is required"}));
        }
    }

    return <Dialog
            maxWidth={matchDownMD ? 'sm' : 'md'}
            open={props.open}
    >
        <DialogTitle><Typography variant="h3">{props.title}</Typography></DialogTitle>
        <DialogContent dividers>
            <Box sx={{mb: 2}}>
                {props.message}
            </Box>
            <Box>
                <Autocomplete
                        renderInput={(params) => (
                                <TextField {...params} label={intl.formatMessage({id: "Entity" })} />
                        )}
                        options={props.entityList}
                        onChange={(event: any, newValue: string | null) => {
                            setValue(newValue ?? "");
                        }}
                />
            </Box>
            {props.subFormEntity && <Box>
                <FormControlLabel control={<Checkbox
                            checked={addSubFields}
                            onChange={onAddSubFieldsChange}
                            size={"small"}
                    />} label={intl.formatMessage({id: "Add all the subfields"})}
                />
            </Box>}
            {(props.error !== "" || localError !== "") && <Box>
                <Typography color={"error"}>{props.error !== "" ? props.error : localError}</Typography>
            </Box>}
        </DialogContent>
        <DialogActions>
            <Button
                    color={"primary"}
                    onClick={onOk}
            >
                {intl.formatMessage({id: "OK"})}
            </Button>
            <Button
                    color={"secondary"}
                    onClick={props.onCancel}
            >
                {intl.formatMessage({id: "Cancel"})}
            </Button>
        </DialogActions>
    </Dialog>
}