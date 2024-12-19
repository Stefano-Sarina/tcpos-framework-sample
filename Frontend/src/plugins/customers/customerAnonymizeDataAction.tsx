import React from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {useIntl} from "react-intl";

export const CustomerAnonymizeDataAction = (props: { active: boolean, setActive: (active: boolean) => void,
    data: Record<string, unknown>, stateDispatch: any}) => {

    const intl = useIntl();

    const handleOk = () => {
        //TODO
        //props.stateDispatch(entityDataContextActions.SET_FIELD_VALUE({entityName: 'customer', entityId: props.data.Id, fieldName: "Description",
        //    value: props.data.CardNumber}));
        props.setActive(false);
    };

    const handleClose = () => {
        props.setActive(false);
    };

    return <Dialog open={props.active} onClose={handleClose}>
        <DialogTitle>
            {intl.formatMessage({id: "Confirmation required"})}
        </DialogTitle>
        <DialogContent>
            <Box>
                {intl.formatMessage({id: 'Customer'}) + ": " + props.data?.Description}
            </Box>
            <Box sx={{mt: '10px'}}>
                {intl.formatMessage({id: 'Do you want to replace the customer name with the card number?'})}
            </Box>
        </DialogContent>
        <DialogActions>
            <Button autoFocus onClick={handleClose}>
                {intl.formatMessage({id: 'Cancel'})}
            </Button>
            <Button
                    onClick={handleOk}
            >
                {intl.formatMessage({id: 'Ok'})}
            </Button>
        </DialogActions>
    </Dialog>;
};