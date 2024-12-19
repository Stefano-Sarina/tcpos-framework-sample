import React from "react";
import {Box, Grid, Typography} from '@mui/material';
import {WD_BoundComboBox, WD_BoundTextField, useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";
import {rwModes} from "@tcpos/common-core";
import type {IRawCRUDWrapperDataUpdate} from "@tcpos/backoffice-components";
import {setObjectData} from "@tcpos/backoffice-core";

export const CustomerCustomTab_additional_definitions = () => {
    const rwMode = "R";
    const entityName = 'customer';
    const entityDataContext = useAppSelector(state =>
        state.dataObjectSlice.objects.find(el => el.objectName === 'customer' && el.objectId === ""));
/*
    const entityDataContext = useEntityDataContext(state =>
        state.objects.find(el => el.objectName === 'customer' && el.objectId === ""));
*/
    const dispatch = useAppDispatch();


    const onUpdate = (modifiedData?: IRawCRUDWrapperDataUpdate[]) => {
        if (entityDataContext) {
            const tmpData = [...entityDataContext.objectData];
            if (modifiedData) {
                modifiedData.forEach(m => {
                    const modifiedField = tmpData.find(el => el.entityName === m.entityName && el.entityId === m.entityId)?.data;
                    if (modifiedField) {
                        (modifiedField as Record<string, unknown>)[m.fieldName] = m.value;
                    }
                });
            }
            dispatch(setObjectData({
                objectName: 'customerTest',
                objectId: "",
                newDataObject: tmpData,
            }));

        }
    };

    return (
        <Grid container spacing={5} justifyContent={'flex-start'}>
            <Grid item xs={12} lg={6}>
                <Grid container spacing={0} alignItems={'center'}>
                    <Box sx={{width: '100%'}}>
                        <Typography variant={'h2'} color={'error'}>Additional definitions</Typography>
                        <Grid container columnSpacing={5}>
                            <Grid item xs={12} lg={6}>
                                <Box>
                                    <WD_BoundComboBox
                                        objectName={entityName}
                                        objectId={""}
                                        componentName={"CostCenterId"}
                                        componentId={"CostCenterId"}
                                        fieldName={"CostCenterId"}
                                        label={"Cost center"}
                                        entityName={'Customers'}
                                        entityId={""}
                                        rwMode={rwModes.W}
                                        type={'string'}
                                        multiSelect={false}
/*
                                        externalList={{
                                            api: {
                                                endpoint: "/api/v1/cost-centers",
                                                operation: "GET"
                                            },
                                            fullList: true,
                                            valueField: "Id",
                                            displayFields: [
                                                "Description"
                                            ]
                                        }}
*/
                                        bindingGuid={'Customers__CostCenterId'}
                                        groupName={"AdditionalDefinitions"}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Box>
                                    <WD_BoundComboBox
                                        objectName={entityName}
                                        objectId={""}
                                        componentName={"CompanyId"}
                                        componentId={"CompanyId"}
                                        fieldName={"CompanyId"}
                                        label={"Company"}
                                        entityName={entityName ?? ""}
                                        entityId={""}
                                        rwMode={rwModes.W}
                                        type={'string'}
                                        multiSelect={false}
/*
                                        externalList={{
                                            api: {
                                                endpoint: "/api/v1/companies",
                                                operation: "GET"
                                            },
                                            fullList: true,
                                            valueField: "Id",
                                            displayFields: [
                                                "Description"
                                            ]
                                        }}
*/
                                        bindingGuid={'Customers__CostCenterId'}
                                        groupName={"AdditionalDefinitions"}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} lg={12}>
                                <Box>
                                    <WD_BoundTextField
                                        objectName={entityName}
                                        objectId={""}
                                        componentName={"MacroId"}
                                        componentId={"MacroId"}
                                        fieldName={"MacroId"}
                                        label={"Keyboard Macro"}
                                        entityName={entityName ?? ""}
                                        entityId={""}
                                        rwMode={rwModes.W}
                                        type={'string'}
                                        groupName={"AdditionalDefinitions"}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Grid>

    );
};