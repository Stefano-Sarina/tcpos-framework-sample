import React from "react";
import {
    Box, Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import {useIntl} from "react-intl";
import {UploadJsonComponent} from "./UploadJsonComponent";

interface IImportJsonDialogProps {
    open: boolean;
    json: string;
    onJsonChanged: (json: string) => void;
    onOk: () => void;
    onCancel: () => void;
    error: string;
}

export const ImportJsonDialog = (props: IImportJsonDialogProps) => {
    const intl = useIntl();

    return <Dialog
            fullScreen
            open={props.open}
    >
        <DialogTitle><Typography variant="h3">Import json</Typography></DialogTitle>
        <DialogContent dividers>
            <Box>
                {intl.formatMessage({id: "Paste the json here..."})}
            </Box>
            <Box>
                <TextField
                        label={intl.formatMessage({id: 'Json'})}
                        value={props.json}
                        onChange={(val) =>
                                props.onJsonChanged(val.target.value)}
                        error={props.error !== ""}
                        helperText={props.error}
                        multiline
                        rows={15}
                        fullWidth
                        id={'jsonTextArea'}
                        InputProps={{style: {fontFamily: 'Monospace'}}}
                        inputProps={{spellCheck: false}}
                />
            </Box>
            <Box>
                {intl.formatMessage({id: "...or upload it:"})}
            </Box>
            <Box>
                <UploadJsonComponent onUpload={props.onJsonChanged} />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button
                    color={"primary"}
                    onClick={props.onOk}
                    disabled={props.error !== "" || props.json === ""}
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
};