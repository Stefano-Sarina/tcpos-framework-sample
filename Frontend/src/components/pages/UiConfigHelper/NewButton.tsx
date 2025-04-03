import React from 'react';
import {WD_DailyActionToolbarButton} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";

interface INewButtonProps {
    onEvent: () => void;
}

export const NewButton = (props: INewButtonProps) => {
    const intl = useIntl();

    return <>
        <WD_DailyActionToolbarButton
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