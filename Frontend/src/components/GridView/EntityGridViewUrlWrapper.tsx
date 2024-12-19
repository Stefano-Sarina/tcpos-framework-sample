import React, { useEffect, useState } from "react";
import {ABaseObjectController, ALocalizationService, type EntityType, type IGridViewModel} from "@tcpos/common-core";
import type {
    AERObjectController, IDynamicDataList, ISingleExternalDataList,
} from "@tcpos/backoffice-core";
import {
    DailyPublicRegistrationContainer,
    setUiStateSearchParameters,
} from "@tcpos/backoffice-core";
import { useParams } from "react-router";
import { useNavigate, useSearchParams } from "react-router-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./cellStyle.scss";
import "./cellStyleWMode.scss";
import "./tippyStyle.scss";
import "./gridViewFooterStyle.scss";
import "../../../fonts/iconFont.scss";
import "./CustomTree.scss";
import "./subFormCellStyle.scss";
import {type IEntityGridViewProps, useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";
import { EntityGridView } from "@tcpos/backoffice-components";
import useConfig from "../themeComponents/useConfig";

/**
 * Wrapper component for EntityGridView. This component reads the url and extracts the information
 * about entityName (database object for API request), current language,
 * list of visible fields, data filter and sort, rows per page, page number.
 *
 * When the component loads, and the entity name and the interface configuration are available,
 * the base parameters for the grid view are set (filters, sorting, visible field list).
 * If these parameters are not provided by the url (e.g., navigation from another page),
 * it searches for the last setting for this entity in the store and redirects to the same url with updated parameters;
 * otherwise, sends the settings (along with the objectController, used in case of editable grid) to the
 * EntityGridView inner component and saves the last settings in the store.
 *
 * If one of the grid parameters changes, the updateData method navigates to the same url with the new param values.
 *
 * The navigateToDetailView method allows navigations to detail view (in read-only mode)
 *
 */
export const EntityGridViewUrlWrapper = () => {

    const themeConfig = useConfig();

    const dispatch = useAppDispatch();

    /**
     * entityName and language are taken from the url
     */
    const {entityName, lang} = useParams();

    /**
     * Other parameters extracted from url params
     */
    const [urlParams, setUrlParams] = useSearchParams();
    const visibleFields: string | null = urlParams.get('vis'); // string or undefined
    const startFilter = urlParams.get('filter'); // string or undefined
    const sortParams = urlParams.get('sort'); // string or undefined
    const rowsPerPage = urlParams.get('rowsPerPage') ? Number(urlParams.get('rowsPerPage')) : 50;
    const currentPage = urlParams.get('page') ? Number(urlParams.get('page')) : 1;

    /**
     * Navigation hook
     */
    const navigate = useNavigate();

    /**
     * Context for UI state
     */
    const uiStateSlice = useAppSelector((state) =>
            state.uiState?.find(el => el.entityName === entityName));

    /**
     * Becomes true after url processing
     */
    const [urlProcessed, setUrlProcessed] = useState<boolean>(false);

    /**
     * If the view params change, the data must be updated navigating to the same page with the new param values
     * @param newVisibleFieldList
     * @param newFilter
     * @param newSort
     * @param newLang
     * @param newPage
     * @param newRowsPerPage
     */
    const updateData = (newVisibleFieldList: string, newFilter: string, newSort: string, newLang: string,
                        newPage: number, newRowsPerPage: number) => {
        if (/*lang !== newLang ||*/ visibleFields !== newVisibleFieldList || startFilter !== newFilter ||
            sortParams !== newSort || currentPage !== newPage || rowsPerPage !== newRowsPerPage) {
            navigate(`/${lang}/entities/${entityName}/list?vis=${newVisibleFieldList}&filter=${newFilter}&sort=${newSort}` +
                    `&page=${newPage}&rowsPerPage=${newRowsPerPage}`);
        }
    };

    /**
     * Navigates to detail view (in read-only mode)
     * @param id
     */
    const navigateToDetailView = (id: string) => {
        navigate(`/${lang}/entities/${entityName}/detail/${id}?mode=R`);
    };

    /**
     * Parameters for inner EntityGridView component
     */
    const [gridViewParams, setGridViewParams] =
            useState<IEntityGridViewProps>({
                entityName: "",
                lang: "en",
                visibleFields: "",
                page: 0,
                rowsPerPage: 0,
                sortParams: "",
                startFilter: "",
                gridViewModel: {layout: [], quickOps: [], disableNewEntity: false, editInline: false, label: ""},
                updateData: updateData,
                navigateToDetailView: navigateToDetailView,
                themeMode: themeConfig.mode
    });

    /**
     * Connection to the interface configuration of the current entity in the store
     */
    const currentEntityGridViewModel: IGridViewModel | undefined = useAppSelector((state) => {
        return state.interfaceConfig?.objectDetails?.find(el => el.objectName === entityName)?.defaultGridView;
    });

    /**
     * If the entity name and the interface configuration are available, sets the base parameters for the grid view
     * (filters, sorting, visible field list). If these parameters are not provided (navigation from another page),
     * searches for the last setting for this entity in the store and redirects to the same url with updated parameters;
     * otherwise, sends the settings (along with the objectController, used in case of editable grid) to the
     * EntityGridView inner component and saves the last settings in the store.
     */
    useEffect(() => {
        if (entityName && entityName !== "" && currentEntityGridViewModel) { // Mandatory data
            if ((!startFilter && startFilter !== "") || (!sortParams && sortParams !== "") ||
                    (!visibleFields && visibleFields !== "")) {
                // Missing url params: check last settings in the store and redirect
                let filterString = "", sortString = "", visibleFieldsString = "";
                if (uiStateSlice && uiStateSlice.lastFilter) {
                    filterString = uiStateSlice.lastFilter;
                }
                if (uiStateSlice && uiStateSlice.lastSorting) {
                    sortString = uiStateSlice.lastSorting;
                }
                if (uiStateSlice && uiStateSlice.lastVisibleFields) {
                    visibleFieldsString = uiStateSlice.lastVisibleFields;
                } else {
                    visibleFieldsString = currentEntityGridViewModel.layout.filter(el => el.indexPosition)
                            .sort((a, b) =>
                                    (a.indexPosition ?? - 1) - (b.indexPosition ?? - 1))
                            .map(el => el.sourceName + '|' + (el.width ?? (el.minWidth ?? 150)))
                            .join(',');
                }
                navigate(`/${lang}/entities/${entityName}/list?vis=${visibleFieldsString}` +
                        `&filter=${filterString}&sort=${sortString}&page=1&rowsPerPage=${rowsPerPage}`);
            } else {
                dispatch(setUiStateSearchParameters({
                    entityName: entityName,
                    lastVisibleFields: visibleFields,
                    lastFilter: startFilter,
                    lastSorting: sortParams,
                    lastLang: lang ?? "",
                    lastPage: currentPage,
                    lastRowsPerPage: rowsPerPage
                }));
                const objectControllerRegistration = DailyPublicRegistrationContainer.isBound("objectControllers", entityName)
                        ? DailyPublicRegistrationContainer.resolveEntry("objectControllers", entityName).controller
                        : undefined;
                const objectController = objectControllerRegistration
                    ? DailyPublicRegistrationContainer.resolveConstructor(objectControllerRegistration) as AERObjectController<EntityType[], EntityType[], ISingleExternalDataList<never>[], IDynamicDataList<never, EntityType[]>[]>
                    : undefined;
                setGridViewParams({
                    entityName: entityName,
                    visibleFields: visibleFields,
                    lang: lang ?? "",
                    startFilter: startFilter,
                    sortParams: sortParams,
                    page: currentPage,
                    rowsPerPage: rowsPerPage,
                    gridViewModel: currentEntityGridViewModel,
                    updateData: updateData,
                    navigateToDetailView: navigateToDetailView,
                    objectController: objectController,
                    themeMode: themeConfig.mode
                });
                setUrlProcessed(true);
            }
        }
    }, [startFilter, sortParams, visibleFields, entityName, lang, currentPage, rowsPerPage, currentEntityGridViewModel]);

    return <>
        {urlProcessed && gridViewParams.gridViewModel &&
            <EntityGridView
                    {...gridViewParams}
            />}
    </>;
};
