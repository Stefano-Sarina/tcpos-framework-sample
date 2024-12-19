import ThemeProvider from "@mui/system/ThemeProvider";
import React, {useEffect, useMemo} from "react";
import type {ReactNode} from "react";
import deepMerge from "deepmerge";
import {createTheme, GlobalStyles} from "@mui/material";
import type {ThemeOptions} from "@mui/system";
import _ from "underscore";
import {useTheme} from "@mui/material/styles";

function getGlobalCssVars(value: unknown,
                          key: string,
                          breadcrumb: string[] = [],
                          data: Record<string, string | null> = {}) {
    //disabled for performance issue, themeloader is better

    if (_.isArray(value) || _.isObject(value)) {
        for (const innerKey in value) {
            //recurse in subkeys

            getGlobalCssVars((value as Record<string, unknown>)[innerKey], innerKey, [...breadcrumb, innerKey], data);
        }
    } else {
        data[`--tc-${[...breadcrumb].join("-")}`] = value === null ? null : String(value);

    }
    return data;
}

/**
 * Provide UI customization for this app
 */
export const DailyThemeOverrides = ({children}: { children: ReactNode }) => {
    const mantisTheme = useTheme();
    useEffect(() => {
        window.document.querySelector("html")?.classList.toggle("dark", mantisTheme.palette.mode == "dark");
    }, [mantisTheme.palette.mode]);
    const DailyTheme: ThemeOptions = {

        components: {
            MuiButton: {
                //override mantis button, icons are too small
                styleOverrides: {
                    startIcon: {
                        '&>*:nth-of-type(1)': {
                            fontSize: '1.5em'
                        }
                    },
                    endIcon: {
                        '&>*:nth-of-type(1)': {
                            fontSize: '1.5em'
                        }
                    }
                }
            },
            MuiPopover: {
                styleOverrides: {
                    paper: {
                        // @ts-ignore
                        boxShadow: (props) => mantisTheme.shadows[props.elevation]
                    }
                }
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: 'rgba(96, 96, 96, 0.92)'
                    }
                },
                defaultProps: {
                    disableInteractive: true
                }
            },
            MuiIconButton: {

                defaultProps: {
                    color: "primary"
                }

            },
            MuiInputLabel: {
                root: {
                    overflow: "visible"
                },
                styleOverrides: {
                    animated: {
                        '&.MuiInputLabel-shrink': {
                            opacity: 1,
                        },


                        opacity: .4,

                    },

                },

            },
            MuiFormControlLabel: {

                styleOverrides: {
                    root: {
//fixes checkbox alignment too left
                        marginLeft: "-9px",
                    }
                }
            },
            MuiFormLabel: {
                styleOverrides: {
                    root: {
//fixes text field labels
                        paddingBottom: "8px"
                    }
                }
            },
            /*   MuiTypography: {
                   styleOverrides: {
                       root: {
                           margin: 0,
                           lineHeight: 1.57,
                           fontFamily: "'Public Sans',sans-serif",
                           fontWeight: 400,
                           fontSize: 'small'
                       }
                   }
               }*/

        }
    };

    const newTheme = useMemo(() => {
        const merged = deepMerge(mantisTheme, DailyTheme);
        return createTheme(merged);
    }, [mantisTheme]);

    return <ThemeProvider theme={newTheme}>
        <GlobalStyles styles={{


            ":root": {
                //store default transition duration prefixed by --tc-
                ...getGlobalCssVars({
                    "spacing-unit": newTheme.spacing(1),
                    "spacing-unit-half": newTheme.spacing(.5),
                    "border-radius": newTheme.shape.borderRadius + "px",
                    "transition-duration-short": newTheme.transitions.duration.short + "ms",
                    "transition-duration-shorter": newTheme.transitions.duration.shorter + "ms",
                    "transition-duration-shortest": newTheme.transitions.duration.shortest + "ms",
                    "transition-duration-standard": newTheme.transitions.duration.standard + "ms",
                    "transition-duration-complex": newTheme.transitions.duration.complex + "ms",
                    "transition-duration-enteringScreen": newTheme.transitions.duration.enteringScreen + "ms",
                    "transition-duration-leavingScreen": newTheme.transitions.duration.leavingScreen + "ms",
                    palette: newTheme.palette

                }, "transition-duration")
            }
        }}/>
        {children}</ThemeProvider>;
};