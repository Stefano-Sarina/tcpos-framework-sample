import React, {useEffect} from "react";
import {DefaultNodeActionsAfterText, TCIcon} from "@tcpos/backoffice-components";
import {
    Box,
    Button,
    ButtonGroup,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Tooltip
} from "@mui/material";
import type {NodeModel} from "@minoru/react-dnd-treeview";
import { NodeType} from "./IJsonTreeData";
import type { IJsonTreeData, IOptionalProperties } from "./IJsonTreeData";


export const CustomNodeAction = (props: NodeModel<IJsonTreeData>) => {

    const addOptionalProperty = (propertyName: IOptionalProperties, index: number) => {
        props.data?.actions?.[index]?.action(props.id, propertyName);
    };

    const DropDownButton = (props: {options: IOptionalProperties[], index: number}) => {
        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef<HTMLDivElement>(null);

        const handleMenuItemClick = (option: IOptionalProperties) => {
            addOptionalProperty(option, props.index);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };


        const handleClose = (event: Event) => {
            if (
                    anchorRef.current &&
                    anchorRef.current.contains(event.target as HTMLElement)
            ) {
                return;
            }

            setOpen(false);
        };

        return <React.Fragment>
                    <ButtonGroup
                            variant={'text'}
                            ref={anchorRef}
                            aria-label="Button group with a nested menu"
                            disableElevation
                    >
                        <Button onClick={handleToggle}
                                sx={{borderRight: '0 !important', margin: 0, minWidth: '20px !important',
                                    paddingLeft: '6px !important', paddingRight: '6px !important'}}
                                variant={'text'}
                                size={'small'}
                                disableElevation
                        >
                            <TCIcon iconCode={'tci-plus'} variant={'body2'} />
                        </Button>
                    </ButtonGroup>
                    <Popper
                            sx={{ zIndex: 1 }}
                            open={open}
                            anchorEl={anchorRef.current}
                            role={undefined}
                            transition
                            disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                                <Grow
                                        {...TransitionProps}
                                        style={{
                                            transformOrigin:
                                                    placement === 'bottom' ? 'center top' : 'center bottom',
                                        }}
                                >
                                    <Paper elevation={4}>
                                        <ClickAwayListener onClickAway={handleClose}>
                                            <MenuList id="split-button-menu" autoFocusItem>
                                                {props.options.map((option, index) => (
                                                        <MenuItem
                                                                key={option.key}
                                                                onClick={() => handleMenuItemClick(option)}
                                                        >
                                                            {option.key}
                                                        </MenuItem>
                                                ))}
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                        )}
                    </Popper>
        </React.Fragment>
    }
    return props.data?.actions?.filter(el => !el.position || el.position === 'end')
                    .map((action, index) => {
                        return action.params?.optionalProperties ?
                                <Box sx={{alignItems: 'center', marginLeft: 2}}>
                                    <DropDownButton options={action.params.optionalProperties} index={index}
                                    />
                                </Box>
                                :
                                <DefaultNodeActionsAfterText
                                        {...{...props, data: {...props.data, actions: [action], typographyProps: {variant: 'caption'}}}}
                                />
            })
            ?? null;
};