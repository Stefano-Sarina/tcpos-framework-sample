import React from 'react';
import {NBO_ActionToolbarButton} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";

interface INewButtonProps {
    onEvent: () => void;
}

export const AddMissingFieldsButton = (props: INewButtonProps) => {
    const intl = useIntl();

    return <>
        <NBO_ActionToolbarButton
                name={'newObject'}
                label={intl.formatMessage({id: 'Add missing fields'})}
                onEvent={props.onEvent}
                isInMoreItemsList={false}
                moreItemsMenuCloseOnEvent={false}
                setMoreItemsMenuClose={() => {}}
                displayStyle={"ICON_ONLY"}
                icon={"auto-fix"}
                enabled={true}
        />
    </>
}