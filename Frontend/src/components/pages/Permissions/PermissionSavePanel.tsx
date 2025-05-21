import React, {startTransition, useEffect, useMemo, useRef, useState} from "react";
import type {IPermissionBeingUpdated} from "./IPermissionBeingUpdated";
import {Button, Dialog, Drawer, Modal, Paper, Slide, Typography} from "@mui/material";
import SvgIcon from "@mui/material/SvgIcon";
import {mdiCheckCircle, mdiInformationVariantCircle} from "@mdi/js";
import {FormattedMessage, useIntl} from "react-intl";
import {number, string} from "yup";


export function PermissionSavePanel({selected, permissionBeingUpdated, onProceed, selectedUserProfile}: {
    permissionBeingUpdated: Array<IPermissionBeingUpdated>,
    selected?: Array<string | number>,
    onProceed: () => void,
    selectedUserProfile?: boolean
}) {
    const [showInfo, setShowInfo] = useState(false);

    const intl = useIntl();


    
    const [internalSelectedValue,setInternalSelectedValue] = useState(selected);
    useEffect(() => {
       if(selected){
          startTransition(()=> setInternalSelectedValue(selected));
       }
    }, [ selected]);
    const open = !!selected?.length;
    return <Drawer
        open={open}
        disableScrollLock
        hideBackdrop
        disableEscapeKeyDown
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        className={"permission-save-panel-root"}
        anchor={"bottom"}

    >
        <Paper className={"permission-save-panel"}>

            <div className={"button-bar"}>
                <div className={"info"}>
                    <SvgIcon fontSize={"inherit"}>
                        <path d={mdiCheckCircle}/>
                    </SvgIcon> <FormattedMessage id={"{selected,plural,one {# selected} other {# selected}}"}
                                                 values={{selected: internalSelectedValue?.length}}/>
                </div>

                {!!permissionBeingUpdated.length &&
                    <Typography component="div" color={"error"} className={"info clickable"}
                                onClick={() => setShowInfo(true)}>
                        <SvgIcon fontSize={"inherit"}>
                            <path d={mdiInformationVariantCircle}/>
                        </SvgIcon> <FormattedMessage id={"{num} chained effects"}
                                                     values={{num: permissionBeingUpdated.length}}/>
                    </Typography>}
                {/* <NBO_Combobox
                    valueList={[]}
                    componentName={'PermissionTypeList'}
                    componentId={'PermissionTypeList'}
                    label={intl.formatMessage({id: "Permission types"})}
                    rwMode={rwModes.W}
                    value={selectedAction}
                    onChange={onSelectedActionChange}
                    error={false}
                    type={""}
                    multiple={true}
                    bindingGuid={""}
                    groupName={""}
                />*/}
                {!selectedUserProfile && <Typography variant={"caption"} color={"error"}><FormattedMessage
                    id={"Select an operator or group to proceed"}></FormattedMessage></Typography>}
                <Button disabled={!selectedUserProfile||!open} variant={"contained"} onClick={() => onProceed()}>
                    <FormattedMessage id={"Proceed"}/>
                </Button>
            </div>
            {/* <Collapse in={showInfo}>
                <div><Box sx={{mr: 8}}>
                    <Typography variant={'h5'}>
                        {intl.formatMessage({id: 'The following permissions will be set'})}
                    </Typography>
                </Box>
                    {permissionBeingUpdated.map((el, index) => (
                        <Box key={'permissionBeingUpdated' + index} sx={{m: 0}}>
                            <Typography color={el.isBeingChanged ? 'error' : undefined}>
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    {el.isBeingChanged &&
                                        <TCIcon
                                            iconCode={'tci-alert-outline'}
                                            data-testid={'permissionBeingUpdated' + index + "_icon"}
                                            sx={{mr: 1}}
                                        />
                                    }
                                    {el.description}
                                </Box>
                            </Typography>
                        </Box>
                    ))}</div>
            </Collapse>*/}
        </Paper>

    </Drawer>;
}