import React, {useEffect, useState} from "react";
import {useIntl} from "react-intl";
import type {IComponentsView} from "./IComponentsView";
import {NBO_ActionToolbarDropDownButton} from "@tcpos/backoffice-components";

interface IComponentsViewSplitButtomProps {
    onViewChange: (view: IComponentsView) => void
    disabled: boolean
}

export const ComponentsViewSplitButton = (props: IComponentsViewSplitButtomProps) => {
    const intl = useIntl();

    const [visibilities, setVisibilities] = useState<IComponentsView>({design: true, preview: true});

    const optionLabels = [intl.formatMessage({id: 'Design'}), intl.formatMessage({id: 'Preview'})];

    const handleMenuItemClick = (index: number,) => {
        const newVisibilities = {
            ...visibilities,
            [Object.keys(visibilities)[index]]: !visibilities[Object.keys(visibilities)[index] as keyof typeof visibilities]
        };
        if (!newVisibilities.preview && !newVisibilities.design) {
            const otherIndex = (index === 0 ? 1 : 0);
            newVisibilities[Object.keys(visibilities)[otherIndex] as keyof typeof visibilities] = true;
        }
        setVisibilities(newVisibilities);
    };

    useEffect(() => {
        props.onViewChange(visibilities);
    }, [props, visibilities])

    return <NBO_ActionToolbarDropDownButton
            subItems={Object.keys(visibilities).map((option, index) => {
                return {
                    name: option,
                    onEvent: (event) => handleMenuItemClick(index),
                    subItemsMenuCloseOnEvent: true,
                    label: optionLabels[index],
                    icon: visibilities[option as keyof typeof visibilities] ? 'eye-outline' : 'eye-off-outline',
                    isInMoreItemsList: false,
                    moreItemsMenuCloseOnEvent: true,
                    setMoreItemsMenuClose: () => {},
                    displayStyle: "ICON_AND_TEXT",
                    enabled: !props.disabled
                };
            })}
            name={"componentsVisibilityDropDownButton"}
            label={intl.formatMessage({id: 'View'})}
            onEvent={() => {}}
            isInMoreItemsList={false}
            moreItemsMenuCloseOnEvent={false}
            setMoreItemsMenuClose={() => {}}
            displayStyle={"TEXT_ONLY"}
            embeddedArrow={true}
    />
}