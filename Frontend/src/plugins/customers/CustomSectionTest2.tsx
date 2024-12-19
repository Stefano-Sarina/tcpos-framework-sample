import React from "react";
import {useParams} from "react-router-dom";
import {setData} from "@tcpos/backoffice-core";
import {useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";

export const CustomSectionTest2 = () => {
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

    return (
            <>
                <div>
                    Code: {' '}
                    <input
                            type={'text'}
                            value={currentData?.fields.find(el => el.name === "Id")?.value ?
                                    String(currentData?.fields.find(el => el.name === "Id")?.value) :
                                    ''}
                            onChange={(e: any) => onChange(e,"Id")}
                    />
                </div>
                <div>
                    <input
                            type={'checkbox'}
                            checked={currentData?.fields.find(el => el.name === "Id")?.value === '1'}
                            onChange={(e: any) => onChange(e,"IsValid")}
                    />
                    {' '} Card valid
                </div>
                <div>
                    Card number: {' '}
                    <input
                            type={'text'}
                            value={currentData?.fields.find(el => el.name === "Id")?.value ?
                                    String(currentData?.fields.find(el => el.name === "CardNumber")?.value) :
                                    ''}
                            onChange={(e: any) => onChange(e,"CardNumber")}
                    />
                </div>
            </>
    );
};