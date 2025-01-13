import React, { useState } from "react";
// material-ui
import { Box, CircularProgress, FormControl, InputAdornment, OutlinedInput } from "@mui/material";

// assets
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { useParams } from "react-router";
import {useAppSelector} from "@tcpos/backoffice-components";

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

const Search = React.memo(() => {
    let timeout: number; // = setTimeout(() => {console.log("TEST");}, 3000);
    const [wait, setWait] = useState<boolean>(false);
    const navigate=useNavigate();
    const [searchPattern, setSearchPattern] = useState<string>("");
    const dirtyData = useAppSelector(state => state.appState.dirtyData);

    const intl=useIntl();
    const {lang} = useParams();
/*
    const localeConfig = useLocaleConfig();

    useEffect(() => {
        localeConfig.changeLanguage(lang as I18n);
    }, [lang]);
*/

    const sendSearch = (pattern: string) => {
        if (pattern.length < 3) {
            return;
        }
        setWait(false);
        navigate(`${intl.locale}/searchResults/` + pattern);
    };

    const onChange = (e: any) => {
        setSearchPattern(e.target.value);
        if (e.target.value.length >= 3) {
            clearTimeout(timeout);
            setWait(true);
            timeout = window.setTimeout(() => {
                sendSearch(e.target.value);
            }, 3000);
        } else {
            setWait(false);
        }
    };

    const onKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            sendSearch(searchPattern);
        }
    };

    return (
            <Box sx={{width: '100%', ml: {xs: 0, md: 1}}}>
                <FormControl sx={{width: '100%'}}>
                    <OutlinedInput
                            size="small"
                            id="header-search"
                            startAdornment={
                                <InputAdornment position="start">
                                    {wait ?
                                            <CircularProgress
                                                    size={20}
                                                    color={'info'}
                                            />
                                            :
                                            <SearchOutlined/>
                                    }
                                </InputAdornment>
                            }
                            aria-describedby="header-search-text"
                            inputProps={{
                                'aria-label': 'weight'
                            }}
                            placeholder=""
                            onChange = {onChange}
                            onKeyDown={onKeyDown}
                            disabled={dirtyData}
                    />
                </FormControl>

            </Box>
    );
});

export default Search;
