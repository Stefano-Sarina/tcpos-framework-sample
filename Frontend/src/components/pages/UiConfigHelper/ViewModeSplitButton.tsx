import React, {useEffect, useState} from "react";
import {TCIcon, WD_DailyActionToolbarDropDownButton} from "@tcpos/backoffice-components";
import type {PageLayoutType} from "./PageLayoutType";

interface ViewModeSplitButtonProps {
    onViewModeChange: (viewMode: PageLayoutType) => void;
}

export const ViewModeSplitButton = (props: ViewModeSplitButtonProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const viewModeH = <TCIcon iconCode={'tci-pause'} variant={'body1'} />;

    const viewModeV = <TCIcon iconCode={'tci-equal'} variant={'body1'} />;

    const viewModeOptions = [viewModeH, viewModeV];

    const icons = ['pause', 'equal'];

    const handleMenuItemClick = (
            index: number,
    ) => {
        setSelectedIndex(index);
    };

    useEffect(() => {
        props.onViewModeChange(selectedIndex === 0 ? 'Horizontal' : 'Vertical');
    }, [props, selectedIndex])

    return <WD_DailyActionToolbarDropDownButton
            subItems={viewModeOptions.map((option, index) => {
                return {
                    name: 'viewOption' + index,
                    onEvent: (event) => handleMenuItemClick(index),
                    subItemsMenuCloseOnEvent: true,
                    label: "",
                    icon: icons[index],
                    isInMoreItemsList: false,
                    moreItemsMenuCloseOnEvent: true,
                    setMoreItemsMenuClose: () => {},
                    displayStyle: "ICON_ONLY"
                };
            })}
            name={"viewModeDropDownButton"}
            label={""}
            onEvent={() => {}}
            icon={icons[selectedIndex]}
            isInMoreItemsList={false}
            moreItemsMenuCloseOnEvent={false}
            setMoreItemsMenuClose={() => {}}
            displayStyle={"ICON_ONLY"}
            enabled={true}
            embeddedArrow={true}
    />
}