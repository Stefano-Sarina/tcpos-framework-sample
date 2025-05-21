import React, { useEffect, useState } from "react";
import type {I18n} from "../../../core/services/intl/I18n";
import MainCard from "../../themeComponents/MainCard";
import { FormattedMessage, useIntl } from "react-intl";
import { Box, Button, CardContent } from "@mui/material";
import {ANextBOConfigService, NextBOPublicRegistrationContainer} from "@tcpos/backoffice-core";
import { AppVersionRow } from "./AppVersionRow";
import { useParams } from "react-router";

interface IVersionHistory {
    version: string;
    description: string;
    build: boolean;
    date?: string;
    commitId?: string;
}

export const AppVersionHistory = () => {
    const intl = useIntl();
    const { lang } = useParams();

/*     const localeConfig = useLocaleConfig();

    useEffect(() => {
        localeConfig.changeLanguage(lang as I18n);
    }, [lang]);
 */
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const onCollapseChange = (collapse: boolean) => {
        setCollapsed(collapse);
    };

    const [versionHistory, setVersionHistory] = useState<IVersionHistory[]>([]);
    const getVersionHistory = async () => {
        const res = await NextBOPublicRegistrationContainer.resolve(ANextBOConfigService).getVersionHistory();
        const versionList: IVersionHistory[] = [];
        res.filter((el: any) => el.version).forEach((el: any) => {
            versionList.push({
                version: el.version,
                description: el.description ?? "",
                build: el.build ?? false,
                date: el.date ?? "",
                commitId: el.commitId ?? "",
            });
        });
        setVersionHistory(versionList);
    };

    useEffect(() => {
        getVersionHistory();
    }, []);

    return (
        <MainCard
            id={"mainCardVersionHistory"}
            title={intl.formatMessage({ id: "Version history" })}
            content={false}
            sx={{
                overflow: "visible",
                flex: "1 0 auto",
                marginBottom: "16px",
                paddingBottom: "16px",
                display: "flex",
                flexDirection: "column",
            }}
            secondary={
                <>
                    <Button
                        size={"small"}
                        onClick={() => onCollapseChange(!collapsed)}
                        id={"A" + "btnCollapseExpandVersionHistory"}
                        sx={{ textTransform: "none" }}
                    >
                        {collapsed ? (
                            <FormattedMessage id={"Expand all"} />
                        ) : (
                            <FormattedMessage id={"Collapse builds"} />
                        )}
                    </Button>
                </>
            }
        >
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    {versionHistory.map((el) => {
                        return !collapsed || el.build ? (
                            <AppVersionRow
                                date={
                                    el.date
                                        ? intl.formatDate(el.date as unknown as Date, {
                                              month: "2-digit",
                                              day: "2-digit",
                                              year: "numeric",
                                          })
                                        : ""
                                }
                                build={el.build}
                                version={el.version}
                                versionDescription={el.description ?? ""}
                                commitId={el.commitId ?? ""}
                                key={el.version}
                            />
                        ) : null;
                    })}
                </Box>
            </CardContent>
        </MainCard>
    );
};
