import React from 'react';
import {WD_DailyActionToolbarButton} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";

interface INewButtonProps {
    onEvent: () => void;
}

export const AddMissingFieldsButton = (props: INewButtonProps) => {
    const intl = useIntl();

    return <>
        <WD_DailyActionToolbarButton
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