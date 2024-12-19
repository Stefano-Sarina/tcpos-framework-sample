import React, {useEffect} from "react";
import {activeItem} from "@tcpos/backoffice-core";
import {useAppDispatch} from "@tcpos/backoffice-components";
import {useParams} from "react-router";
import {LocalePageWrapper} from "./LocalePageWrapper";

interface IPageWrapperProps {
    pageRegistrationName?: string,
    children: React.ReactElement
}

export const PageWrapper = ({pageRegistrationName, children}: IPageWrapperProps) => {
    const {entityName} = useParams();

    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(activeItem({openItem: [pageRegistrationName !== undefined ? pageRegistrationName : (entityName ?? "")]}));
    }, [entityName, pageRegistrationName]);
    return <>
        <LocalePageWrapper>
            {children}
        </LocalePageWrapper>
    </>;
};