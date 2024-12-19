import React, {useEffect, useState} from "react";
import {Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box} from '@mui/material';

export const CustomerChangePasswordQuickAction = (props: { active: boolean, setActive: (active: boolean) => void,
                    data: Record<string, unknown>}) => {

    const customerId = props.data ? props.data["Id"] : "";

    const [newPassword, setNewPassword] = useState<string>("");
    const [newPassword2, setNewPassword2] = useState<string>("");

    const reset = () => {
        setNewPassword("");
        setNewPassword2("");
    };

    const [error, setError] = useState<string>("");
    const handleClose = () => {
        reset();
        props.setActive(false);
    };

    const handleOk = () => {
        console.log(`Password changed for customer id ${customerId}.`);
        reset();
        props.setActive(false);
    };

    const validate = () => {
        return newPassword === newPassword2;
    };

    const handleNewPwChange = (e: any) => {
        setNewPassword(e.target.value);
        setError(!validate() ? "New password must match" : "");
    };

    const handleNewPw2Change = (e: any) => {
        setNewPassword2(e.target.value);
        setError(!validate() ? "New passwords must match" : "");
    };

    useEffect(() => {
        setError(!validate() ? "New passwords must match" : "");
    }, [newPassword, newPassword2]);

    return <Dialog open={props.active} onClose={handleClose} >
        <DialogTitle>
            Change customer password
        </DialogTitle>
        <DialogContent>
            <Box>
                {'Customer: ' + props.data?.Description}
            </Box>
            <form autoComplete={'off'}>
                <Box sx={{mt: '10px'}}>
                    <TextField
                            fullWidth
                            value={newPassword}
                            onChange={handleNewPwChange}
                            label={'New password'}
                            type={'password'}
                            autoComplete={'new-password'}
                            autoCorrect={"off"}
                            autoCapitalize={"off"}
                            spellCheck={false}
                            inputProps={{
                                autoComplete: 'new-password',
                                form: {
                                    autoComplete: 'off'
                                }
                            }}
                            InputProps={{
                                autoComplete: 'new-password',
                            }}
                            InputLabelProps={{
                                className: !newPassword ? 'empty-field-label-style' : ''
                            }}
                    />
                </Box>
                <Box sx={{mt: '10px'}}>
                    <TextField
                            fullWidth
                            value={newPassword2}
                            onChange={handleNewPw2Change}
                            label={'Retype new password'}
                            type={'password'}
                            autoComplete={'new-password'}
                            autoCorrect={"off"}
                            autoCapitalize={"off"}
                            spellCheck={false}
                            inputProps={{
                                autoComplete: 'new-password',
                                form: {
                                    autoComplete: 'off'
                                }
                            }}
                            InputProps={{
                                autoComplete: 'new-password',
                            }}
                            InputLabelProps={{
                                className: !newPassword2 ? 'empty-field-label-style' : ''
                            }}
                            error={error !== ""}
                            helperText={error}
                    />
                </Box>

            </form>
        </DialogContent>
        <DialogActions>
            <Button autoFocus onClick={handleClose}>
                Cancel
            </Button>
            <Button
                    onClick={handleOk}
                    disabled={newPassword === "" || newPassword2 === "" || error !== ""}
            >
                Ok
            </Button>
        </DialogActions>
    </Dialog>;
};