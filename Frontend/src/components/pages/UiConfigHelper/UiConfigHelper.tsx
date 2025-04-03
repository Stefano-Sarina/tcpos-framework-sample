import React, {useMemo, useState} from "react";
import {Grid} from "@mui/material";
import {WD_TextArea} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";
import {rwModes} from "@tcpos/common-core";

export const UiConfigHelper = () => {
    const intl = useIntl();
    const [jsonConfigValue, setJsonConfigValue] = useState<string>("");
    const [error, setError] = useState<boolean>(false);

    const onJsonConfigChange = (value: string) => {
        setJsonConfigValue(value);
    };

    const Renderer = useMemo(() => <>

    </>, [jsonConfigValue]);


    return  <Grid container spacing={3}>
        <Grid item xs={12}>
            <WD_TextArea
                    componentName={'textAreaJsonConfig'}
                    bindingGuid={""}
                    groupName={""}
                    label={intl.formatMessage({id: 'JSON configuration'})}
                    rwMode={rwModes.W}
                    value={jsonConfigValue}
                    onChange={onJsonConfigChange}
                    error={error}
                    type={""}
                    messages={[]}
                    rowNumber={20}
            />
        </Grid>
        <Grid item xs={12}>

        </Grid>
    </Grid>
}