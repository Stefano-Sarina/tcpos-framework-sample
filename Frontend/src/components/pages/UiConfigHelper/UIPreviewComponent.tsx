import {Box, Card, CardContent, FormControlLabel, Grid, IconButton, Radio, RadioGroup, Typography} from "@mui/material";
import {DetailViewComponent} from "../../EntityComponent/DetailViewComponent";
import type {IInterfaceBuilderModel} from "@tcpos/common-core";
import {rwModes} from "@tcpos/common-core";
import React, {useCallback, useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {useIntl} from "react-intl";
import type {JsonRendererViewModeType} from "./JsonRendererViewModeType";
import type {IUiPermissions} from "../../EntityComponent/IUIPermissions";
import {getInterfaceBuilderModel} from "@tcpos/backoffice-core";
import "./uiPreviewComponent.scss";
import {OpenInNew} from "@mui/icons-material";
import type {IUIPreviewComponentProps} from "./IUIPreviewComponentProps";

export const UIPreviewComponent = (props: IUIPreviewComponentProps) => {
    const theme = useTheme();
    const intl = useIntl();

    const [jsonModel, setJsonModel] =
            useState<IInterfaceBuilderModel | undefined>(undefined);

    const [viewMode, setViewMode] =
            useState<JsonRendererViewModeType>('edit');

    const handleViewModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setViewMode(((event.target as HTMLInputElement).value) as JsonRendererViewModeType);
    };

    const handleChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        props.handleTabsValueChange(newValue);
    }, []);

    const [uiPermissions, setUiPermissions] =
            useState<IUiPermissions[] | undefined>(undefined)
    const defaultObjectName = '_fake';

    const getExternalListFoo = async (componentId: string, listName: string) => {
        const foo = () => [];
        await foo();
    };

    useEffect(() => {
        if (props.json) {
            try {
                const newModel: IInterfaceBuilderModel = props.json;
                const model = getInterfaceBuilderModel(newModel);
                if ((model as { error: string }).error) {
                    //setMessage("Wrong model");
                    setJsonModel(undefined);
                } else {
                    const convertedModel = model as IInterfaceBuilderModel;
                    setJsonModel(convertedModel);
                    //setMessage("");
                    const componentNames: string[] = [];
                    const objectName = props.objectName || defaultObjectName;
                    convertedModel.detailView.layoutGroups.forEach(g => {
                        componentNames.push(objectName + '.' + g.groupName);
                        g.sections.forEach(sec => {
                            componentNames.push(objectName + '.' + g.groupName + '.' + sec.entityName);
                            sec.components.forEach(c => {
                                componentNames.push(objectName + '.' + g.groupName + '.' + sec.entityName + '.' + c.componentName);
                            })
                        });
                    });
                    setUiPermissions([{access: "Write", componentName: objectName},
                        ...componentNames.map(el => ({
                            access: "Write" as "NoAccess" | "Read" | "Write" | "NotSet", componentName: el
                        }))
                    ]);
                }
            } catch (err) {
                //setMessage("Wrong model - " + err);
                setJsonModel(undefined);
            }
        }

        return () => {
            // Cleanup function to ensure the component is correctly unmounted
            setJsonModel(undefined);
            setUiPermissions(undefined);
            setViewMode('edit'); // Reset view mode
            props.handleTabsValueChange(0); // Reset tabs value
        };
    }, [props.json]);

    return jsonModel && (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{overflow: 'unset', border: 0, boxShadow: 'none'}}>
                        <CardContent>
                            <Box>
                                <Grid container spacing={6} alignItems={'stretch'}>
                                    <Grid item xs={12} md={12} display={'flex'} flex={1}
                                          sx={{height: '100%', marginTop: '-36px'}}>
                                        <Box sx={{margin: '16px 16px 16px 16px'}} width={'100%'}
                                             /*height={'calc(100vh)'}*/>
                                            <Grid container spacing={3} alignItems={'stretch'}
                                                  flexDirection={'row'}
                                            >
                                                <Grid item xs={12}
                                                      md={12}
                                                      display={'flex'} flex={1}
                                                >
                                                    <Box sx={{
/*
                                                        height: '100vh',
*/
                                                        minHeight: '100%',
                                                        overflow: 'unset',
                                                        backgroundColor: theme.palette.background.paper,
                                                        ml: 0,
                                                        mt: 0,
                                                        width: '100%'
                                                    }}>
                                                        <Box sx={{
                                                            ml: 0,
                                                            mt: 0,
                                                            pl: 2,
                                                            pt: 2,
                                                            mb: 1,
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            justifyContent:
                                                                    'flex-start',
                                                            alignItems: 'center',
                                                            position: "sticky",
                                                            top: 0,
                                                            backgroundColor: theme.palette.background.paper,
                                                            overflow: 'hidden',
                                                            zIndex: 10
                                                        }}>
                                                            {props.isInMainWindow &&
                                                                    <IconButton aria-label={"open in new window"}
                                                                                onClick={() => props.onOpenInNewWindowClick?.()}
                                                                    >
                                                                        <OpenInNew/>
                                                                    </IconButton>}
                                                            <Typography variant={'h5'} sx={{flex: 1}}>
                                                                {`${intl.formatMessage({id: 'Preview'})} - ${jsonModel.objectName}`}
                                                            </Typography>
                                                            <RadioGroup
                                                                    row
                                                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                                                    name="row-radio-buttons-group"
                                                                    value={viewMode}
                                                                    onChange={handleViewModeChange}
                                                            >
                                                                <FormControlLabel value={'edit'}
                                                                                  control={<Radio size={'small'}/>}
                                                                                  label={intl.formatMessage({id: 'Edit mode'})}
                                                                />
                                                                <FormControlLabel value={'read'}
                                                                                  control={<Radio size={'small'}/>}
                                                                                  label={intl.formatMessage({id: 'Read-only mode'})}
                                                                />
                                                            </RadioGroup>
                                                        </Box>
                                                        <Grid container
                                                              spacing={3}
                                                              sx={{
                                                                  '@keyframes highlight': {
                                                                      "0%": {"background-color": theme.palette.background.default},
                                                                      "50%": {"background-color": "#ffff00"},
                                                                      "75%": {"background-color": "fffde7"},
                                                                      "100%": {"background-color": theme.palette.background.default},
                                                                  }
                                                              }}
                                                        >
                                                            <Grid className={props.classes?.gridItem} item xs={12}>
                                                                <form>
                                                                    <Card
                                                                            className={"mainCard"}
                                                                            elevation={0}
                                                                            sx={{
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                overflow: "visible",
                                                                                backgroundColor: theme => theme.palette.background.default,
                                                                                ">.MuiCardHeader-root": {
                                                                                    backgroundColor: theme => theme.palette.background.default /*"background.paper"*/,
                                                                                    zIndex: "fab",
                                                                                    paddingTop: "8px",
                                                                                    paddingBottom: "8px",
                                                                                },
                                                                            }}
                                                                    >
                                                                        <Box sx={{margin: 1}}>
                                                                            <Typography variant={'h5'} sx={{flex: 1}}>
                                                                                {`${jsonModel.detailView.label} - ${jsonModel.detailView.titleField}`}
                                                                            </Typography>
                                                                        </Box>
                                                                        <DetailViewComponent
                                                                                currentGroupsList={jsonModel.detailView}
                                                                                entityName={props.objectName || defaultObjectName}
                                                                                entityId={'0'}
                                                                                rwMode={props.readWriteModeOverride ?? (viewMode === 'edit' ? rwModes.W : rwModes.R)}
                                                                                tabsValue={props.tabsValue}
                                                                                onChange={handleChange}
                                                                                onAddSubRow={() => {
                                                                                }}
                                                                                onDeleteSubRow={() => {
                                                                                }}
                                                                                uiPermissions={uiPermissions}
                                                                                errorList={[]}
                                                                                getExternalList={getExternalListFoo}
                                                                                initializeList={() => {
                                                                                }}
                                                                                multiEditing={false}
                                                                                visibilityRules={[]}
                                                                                visibleRowIndex={[]}
                                                                                stickyTop={0}
                                                                                containerWidth={props.containerWidth}
                                                                                classes={props.classes?.detailView}
                                                                        />
                                                                    </Card>
                                                                </form>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
    );
};