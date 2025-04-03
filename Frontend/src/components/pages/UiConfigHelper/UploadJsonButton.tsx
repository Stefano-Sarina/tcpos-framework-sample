import React from 'react';
import {WD_DailyActionToolbarButton} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";

interface INewButtonProps {
    onEvent: () => void;
}

export const UploadJsonButton = (props: INewButtonProps) => {
    const intl = useIntl();

    return <>
        <WD_DailyActionToolbarButton
                name={'uploadJson'}
                label={intl.formatMessage({id: 'Upload JSON'})}
                onEvent={props.onEvent}
                isInMoreItemsList={false}
                moreItemsMenuCloseOnEvent={false}
                setMoreItemsMenuClose={() => {}}
                displayStyle={"ICON_ONLY"}
                icon={'upload'}
                enabled={true}
        />
    </>
}