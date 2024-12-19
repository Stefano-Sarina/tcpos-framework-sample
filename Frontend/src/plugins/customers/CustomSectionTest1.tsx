import React from "react";
import {useParams} from "react-router-dom";
import {setData, setObjectData} from "@tcpos/backoffice-core";
import {WD_BoundTextField, WD_BoundCheckBox, useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";
import {rwModes} from "@tcpos/common-core";
import type {IRawCRUDWrapperDataUpdate} from "@tcpos/backoffice-components";

export const CustomSectionTest1 = () => {
    const {entityName} = useParams();
    const currentData = useAppSelector((state) =>
        state.dataSlice.find(el => el.entityName === entityName));
    const dispatch = useAppDispatch();

    const onChange = (e: { target: { value: string; }; }, field: string) => {
        const fieldIdx = currentData?.fields.findIndex(el => el.name === field);
        if (currentData && fieldIdx !== undefined && fieldIdx >= 0) {
            const newState: Record<string, any> = {...currentData.fields[fieldIdx], value: e.target.value};
            dispatch(setData({newState: newState, entityName: entityName ?? "", fieldIdx: fieldIdx}));
        }
    };

    const onCheckedChanged = (value: string, field: string) => {
        const fieldIdx = currentData?.fields.findIndex(el => el.name === field);
        if (currentData && fieldIdx !== undefined && fieldIdx >= 0) {
            const newState: Record<string, any> = {...currentData.fields[fieldIdx], value: value};
            dispatch(setData({newState: newState, entityName: entityName ?? "", fieldIdx: fieldIdx}));
        }
    };

    const entityDataContext = useAppSelector(state =>
        state.dataObjectSlice.objects.find(el => el.objectName === 'customer' && el.objectId === ""));
/*
    const entityDataContext = useEntityDataContext(state =>
        state.objects.find(el => el.objectName === 'customer' && el.objectId === ""));
*/

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
        <>
            <WD_BoundTextField
                objectName={entityName ?? ""}
                objectId={""}
                componentName={"CodeTest1"}
                componentId={"CodeTest1"}
                fieldName={"Id"}
                label={"Test code"}
                entityName={entityName ?? ""}
                entityId={""}
                rwMode={rwModes.W}
                type={'string'}
                groupName={"AdditionalDefinitions"}
            />
            <WD_BoundCheckBox
                objectName={entityName ?? ""}
                objectId={""}
                componentName={"CardValidTest1"}
                componentId={"CardValidTest1"}
                fieldName={"IsValid"}
                label={"Test card valid"}
                entityName={entityName ?? ""}
                entityId={""}
                rwMode={rwModes.W}
                type={'boolean'}
                bindingGuid={'Customers__CardValidTest1'}
                groupName={"AdditionalDefinitions"}
            />
            <WD_BoundTextField
                objectName={entityName ?? ""}
                objectId={""}
                componentName={"CardNumberTest1"}
                componentId={"CardNumberTest1"}
                fieldName={"CardNumber"}
                label={"Test card number"}
                entityName={entityName ?? ""}
                entityId={""}
                rwMode={rwModes.W}
                type={'string'}
                groupName={"AdditionalDefinitions"}
            />
        </>
    );
};