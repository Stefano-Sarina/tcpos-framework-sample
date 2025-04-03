import React from 'react';
import {WD_DailyActionToolbarButton} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";

interface INewButtonProps {
    onEvent: () => void;
}

export const DownloadJsonButton = (props: INewButtonProps) => {
    const intl = useIntl();

    return <>
        <WD_DailyActionToolbarButton
                name={'downloadJson'}
                label={intl.formatMessage({id: 'Download JSON'})}
                onEvent={props.onEvent}
                isInMoreItemsList={false}
                moreItemsMenuCloseOnEvent={false}
                setMoreItemsMenuClose={() => {}}
                displayStyle={"ICON_ONLY"}
                icon={'download'}
                enabled={true}
        />
    </>
}