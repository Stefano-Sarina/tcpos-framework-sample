import React from 'react';
import {NBO_ActionToolbarButton} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";

interface INewButtonProps {
    onEvent: () => void;
}

export const UploadJsonButton = (props: INewButtonProps) => {
    const intl = useIntl();

    return <>
        <NBO_ActionToolbarButton
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