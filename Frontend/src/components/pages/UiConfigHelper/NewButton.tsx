import React from 'react';
import {NBO_ActionToolbarButton} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";

interface INewButtonProps {
    onEvent: () => void;
}

export const NewButton = (props: INewButtonProps) => {
    const intl = useIntl();

    return <>
        <NBO_ActionToolbarButton
                name={'newObject'}
                label={intl.formatMessage({id: 'New'})}
                onEvent={props.onEvent}
                isInMoreItemsList={false}
                moreItemsMenuCloseOnEvent={false}
                setMoreItemsMenuClose={() => {}}
                displayStyle={"ICON_ONLY"}
                icon={'file-document-outline'}
                enabled={true}
        />
    </>
}