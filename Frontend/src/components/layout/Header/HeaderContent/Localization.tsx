import React, {useRef, useState} from "react";

// material-ui
import {useTheme} from "@mui/material/styles";
import {
    Box,
    ClickAwayListener,
    Grid,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Popper,
    Typography,
    useMediaQuery,
} from "@mui/material";

// project import
import IconButton from "../../../themeComponents/@extended/IconButton";
import Transitions from "../../../themeComponents/@extended/Transitions";
import {useAppSelector} from "@tcpos/backoffice-components";

// assets
import {TranslationOutlined} from "@ant-design/icons";
import {useLocation, useNavigate} from "react-router-dom";
import type {I18n} from "../../../../core/services/intl";
import {LanguageDictionary} from "../../../../core/businessLogic/languages";

// ==============================|| HEADER CONTENT - LOCALIZATION ||============================== //

const Localization = () => {
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down("md"));

    const i18n = useAppSelector(state => state.config.languageInfo.lang);

    const navigate = useNavigate();
    const location = useLocation();

    const anchorRef = useRef<any>(null);
    const [open, setOpen] = useState(false);
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleListItemClick = (lang: I18n) => {
        //localeConfig.changeLanguage(lang);
        setOpen(false);
/*
        const expires = (new Date(Date.now()+ 86400*365*1000)).toUTCString();
        document.cookie = "lang=" + lang + "; expires=" + expires + ";path=/;";
*/
        //if (i18n !== lang) {
            // If another browser tab with a different language was opened, the i18n value was updated, but the url didn't change;
            // this means that lang didn't change, too, and no language change is triggered.
        //    onChangeLocalization(lang);
        //}
        if (i18n !== lang) {
            navigate(location.pathname.replace(location.pathname.split("/")[1], lang) + location.search);
        }
    };

    const iconBackColorOpen = theme.palette.mode === "dark" ? "grey.200" : "grey.300";
    const iconBackColor = theme.palette.mode === "dark" ? "background.default" : "grey.100";
    return (
        <Box sx={{ flexShrink: 0, ml: 0.75 }}>
            <IconButton
                color="secondary"
                variant="light"
                sx={{ color: "text.primary", bgcolor: open ? iconBackColorOpen : iconBackColor }}
                aria-label="open localization"
                ref={anchorRef}
                aria-controls={open ? "localization-grow" : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                data-testid={"LocalizationChangeLanguageButton"}
            >
                <TranslationOutlined />
            </IconButton>
            <Popper
                placement={matchesXs ? "bottom-start" : "bottom"}
                sx={{ zIndex: 10000 }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                popperOptions={{
                    modifiers: [
                        {
                            name: "offset",
                            options: {
                                offset: [matchesXs ? 0 : 0, 9],
                            },
                        },
                    ],
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions type="fade" in={open} {...TransitionProps}>
                        <Paper sx={{ boxShadow: theme.customShadows.z1 }}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <List
                                    component="nav"
                                    sx={{
                                        p: 0,
                                        width: "100%",
                                        minWidth: 200,
                                        maxWidth: 290,
                                        bgcolor: theme.palette.background.paper,
                                        borderRadius: 0.5,
                                        [theme.breakpoints.down("md")]: {
                                            maxWidth: 250,
                                        },
                                    }}
                                >
                                    {Object.keys(LanguageDictionary).map(k => {
                                        return (
                                            <ListItemButton
                                                selected={i18n === LanguageDictionary[k as I18n].code}
                                                onClick={() => handleListItemClick(LanguageDictionary[k as I18n].code as I18n)}
                                                key={"Lang" + LanguageDictionary[k as I18n].code}
                                                data-testid={"LocalizationLang_" + LanguageDictionary[k as I18n].code}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Grid container>
                                                            <Typography color="textPrimary">{LanguageDictionary[k as I18n].descr}</Typography>
                                                            {/*
                                            <Typography variant="caption" color="textSecondary" sx={{ ml: '8px' }}>
                                                ({el.shortDescription})
                                            </Typography>
*/}
                                                        </Grid>
                                                    }
                                                />
                                            </ListItemButton>
                                        );
                                    })}
                                    {/*
                  <ListItemButton selected={i18n === 'fr'} onClick={() => handleListItemClick('fr')}>
                    <ListItemText
                      primary={
                        <Grid container>
                          <Typography color="textPrimary">français</Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ ml: '8px' }}>
                            (French)
                          </Typography>
                        </Grid>
                      }
                    />
                  </ListItemButton>
                  <ListItemButton selected={i18n === 'ro'} onClick={() => handleListItemClick('ro')}>
                    <ListItemText
                      primary={
                        <Grid container>
                          <Typography color="textPrimary">Română</Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ ml: '8px' }}>
                            (Romanian)
                          </Typography>
                        </Grid>
                      }
                    />
                  </ListItemButton>
                  <ListItemButton selected={i18n === 'zh'} onClick={() => handleListItemClick('zh')}>
                    <ListItemText
                      primary={
                        <Grid container>
                          <Typography color="textPrimary">中国人</Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ ml: '8px' }}>
                            (Chinese)
                          </Typography>
                        </Grid>
                      }
                    />
                  </ListItemButton>
*/}
                                </List>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </Box>
    );
};

export default Localization;
