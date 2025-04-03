import React, {useEffect, useState} from "react";
import {useParams} from 'react-router';
import {
    DailyPublicRegistrationContainer,
    ABaseApiController
} from "@tcpos/backoffice-core";
import MainCard from '../themeComponents/MainCard';
import {List, ListItem, ListItemIcon, ListItemText, ListSubheader, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import _ from 'underscore';
import {useAppSelector, TCIcon} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";
import { useAbortableEffect } from "@tcpos/common-components";

interface ISearchResults {
    header: string,
    detail: string,
    id: string
}

interface IEntitySearchResult {
    entity: string,
    label: string,
    icon: string,
    idField: string,
    results: ISearchResults[]
}

export const SearchResults = () => {
    const {query} = useParams();
    const entityList = useAppSelector(state => _.flatten(state.interfaceConfig.menuGroups.map(el => el.entities)));

    const [searchEntities, setSearchEntities] = useState<IEntitySearchResult[]>([]);

    const intl = useIntl();
    const search = (textSearch: string, abortSignal: AbortSignal) => {
        const allSearches: IEntitySearchResult[] = [];
        if (entityList) {
            entityList.map(e => {
                const getDataEndPoint = e.endpoints?.gridReadOp;
                if (getDataEndPoint) {
                    let filter = "contains(" + getDataEndPoint.mainFieldSearch + "," + "'" + query + "')";
                    if (getDataEndPoint.secondaryFieldsSearch) {
                        getDataEndPoint.secondaryFieldsSearch.map(f => {
                            filter += " or " + "contains(" + f.field + "," + "'" + query + "')";
                        });
                    }
                    const fetchData = async () => {
                        const response = await DailyPublicRegistrationContainer.resolve(ABaseApiController)
                                .getData(getDataEndPoint.endpoint, false)
                                .apiCall({queryParams: {}, noCache: true, filter: filter, select: [], abortSignal}) as Record<string, string>[];
                        const nextResponse: ISearchResults[] = response.map((el: Record<string, string>) => {
                            return {
                                header: el[getDataEndPoint.mainFieldSearch ?? ""] ?? "",
                                detail: (getDataEndPoint.secondaryFieldsSearch?.map(
                                        s => s.label + ": " + (el[s.field] ?? "")).join(" - ")) ?? "",
                                id: el[getDataEndPoint.idFieldSearch ?? "Id"] ?? ""
                            };
                        });
                        allSearches.push({
                            entity: e.entityId,
                            label: e.label,
                            icon: e.icon,
                            idField: getDataEndPoint.idFieldSearch ?? "Id",
                            results: nextResponse
                        });
                        setSearchEntities(allSearches);
                    };
                    fetchData();
                }
            });
        }
    };

    useAbortableEffect((abortSignal) => {
        if (query) {
            search(query, abortSignal);
        }
    }, [query]);

    return (
            <MainCard title={'Search results'}>
                {searchEntities.map(search => {
                    return (
                            <List sx={{width: '100%', bgColor: 'background.paper'}}
                                  component="nav"
                                  aria-labelledby="nested-list-subheader"
                                  subheader={
                                      <ListSubheader component="div" id="nested-list-subheader">
                                          <Typography variant={'h5'}>
                                              {'Category: ' + search.label + ' - Found ' + search.results.length}
                                          </Typography>
                                      </ListSubheader>
                                  }
                            >
                                {search.results.map((el: any) => {
                                    return <ListItem>
                                        <ListItemIcon sx={{mr: '5px'}}>
                                            <TCIcon iconCode={'tci-' + search.icon} variant={'h5'} sx={{fontSize: '1rem'}}/>
                                        </ListItemIcon>
                                        <ListItemText
                                                primary={
                                                    <Link
                                                            to={`/${intl.locale}/entities/${search.entity}/detail/${el.id}?mode=R`}
                                                    >
                                                        {el.header}
                                                    </Link>
                                                }
                                                secondary={el.detail}
                                        />
                                    </ListItem>;
                                })}
                            </List>
                    );
                })}
            </MainCard>
    );
};