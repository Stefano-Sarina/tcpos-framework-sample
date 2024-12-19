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
    const search = () => {
        const allSearches: IEntitySearchResult[] = [];
        if (entityList) {
            entityList.map(e => {
                const getDataEndPoint = e.endpoints?.gridReadOp;
                if (getDataEndPoint) {
                    let filter = "contains(" + getDataEndPoint.mainFieldSearch + "," + "%27" + query + "%27)";
                    if (getDataEndPoint.secondaryFieldsSearch) {
                        getDataEndPoint.secondaryFieldsSearch.map(f => {
                            filter += " or " + "contains(" + f.field + "," + "%27" + query + "%27)";
                        });
                    }
                    const fetchData = async () => {
                        const response = await DailyPublicRegistrationContainer.resolve(ABaseApiController)
                                .apiGet(getDataEndPoint.endpoint, [], {filter: filter}, true) as Record<string, string>[];

/*
                                .apiCallobs(getDataEndPoint.endpoint + "?$filter=" + filter,
                                        {}, {}, "GET", false);
*/
                        const nextResponse: ISearchResults[] = response.map((el: Record<string, string>) => {
                            return {
                                header: el[getDataEndPoint.mainFieldSearch ?? ""] ?? "",
                                detail: (getDataEndPoint.secondaryFieldsSearch?.map(
                                        s => s.label + ": " + (el[s.field] ?? "")).join(" - ")) ?? "",
                                id: el[getDataEndPoint.idFieldSearch ?? ""] ?? ""
                            };
                        });
                        allSearches.push({
                            entity: e.entityId,
                            label: e.label,
                            icon: e.icon,
                            idField: getDataEndPoint.idFieldSearch ?? "",
                            results: nextResponse
                        });
                    };
                    fetchData();
                }
            });
            setSearchEntities(allSearches);
        }
    };

    useEffect(() => {
                search();
            }, [query]
    );

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