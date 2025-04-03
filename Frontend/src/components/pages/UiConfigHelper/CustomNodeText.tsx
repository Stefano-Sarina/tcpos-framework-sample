import {Box, Button, FormControl, MenuItem, Select } from "@mui/material";
import type {SelectChangeEvent} from "@mui/material";
import React, {useRef, useState} from "react";
import {TCIcon} from "@tcpos/backoffice-components";
import type {NodeModel} from "@minoru/react-dnd-treeview";
import { NodeType} from "./IJsonTreeData";
import type {IJsonTreeData} from "./IJsonTreeData";
import './customNodeText.scss';
import {useTheme} from "@mui/material/styles";

export const CustomNodeText = (props: NodeModel<IJsonTreeData>) => {
    const theme = useTheme();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editedText, setEditedText] = useState<string>(props.data?.text2 ?? '');
    const fixedValueSet = props.data?.nodeType === NodeType.Leaf && !!props.data?.allowedValues;
    const [editedOption, setEditedOption] = useState<string | number>(
            props.data?.nodeType === NodeType.Leaf ? (props.data?.allowedValues?.[0] ?? '') : '');

    const ref =  useRef<HTMLInputElement>(null);
    const onNodeText2ChangeCancel = () => {
        setEditMode(false);
        const actionParams = props.data?.customActions?.find(el => el.name === 'onChangeEditMode');
        if (actionParams) {
            actionParams.action(props.id, {value: props.data?.text2, edit: false});
        }
    };

    const onNodeText2ConfirmChange = () => {
        setEditMode(false);
        if (props.data?.customActions && Array.isArray(props.data?.customActions)) {
            const actionParams = props.data?.customActions?.find(el => el.name === 'onTextChanged');
            if (actionParams) {
                actionParams.action(props.id, !fixedValueSet ? editedText : editedOption);
            }
        }
    };

    const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedText(event.target.value);
    }

    const onChangeSelection = (e: SelectChangeEvent<string | number>) => {
        setEditedOption(e.target.value);
    };

    const onSetEditMode = () => {
        setEditMode(true);
        if (props.data?.customActions) {
            const actionParams = props.data?.customActions?.find(el => el.name === 'onChangeEditMode');
            if (actionParams) {
                actionParams.action(props.id, {value: props.data?.text2, edit: true});
            }
        }
        if (!fixedValueSet) {
            setEditedText(props.data?.text2 ?? '');
            setTimeout(() => {
                ref.current?.focus();
            }, 0);
        }
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onNodeText2ConfirmChange();
        } else if (event.key === 'Escape') {
            onNodeText2ChangeCancel();
        }
    }

    return <Box sx={{marginLeft: props.data?.icon ? 2 : 1, display: 'flex', flex: 1, alignItems: 'center',
            backgroundColor: editMode ? theme.palette.warning.light : undefined}}>
        <Box>{props.text}</Box>
        {props.data?.text2 ?
                <Box sx={{flex: props.data?.nodeType === NodeType.Leaf && props.data?.editable ? 1 : undefined,
                            ml: 1, display: 'flex', alignItems: 'center'}}>
                    {props.data?.nodeType === NodeType.Leaf && props.data?.editable && !props.data?.blocked_update ?
                        (editMode ?
                            <Box sx={{display: 'flex', flex: 1}}>
                                {props.data?.allowedValues ?
                                        <FormControl>
                                            <Select
                                                    value={editedOption}
                                                    onChange={onChangeSelection}
                                                    defaultOpen={true}
                                                    variant={'standard'}
                                            >
                                                {props.data?.allowedValues.map((el, index) => (
                                                        <MenuItem key={index} value={el}>{el}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                        :
                                        <input ref={ref} type="text" style={{flex: 1}} value={editedText}
                                               onChange={onChangeText}
                                               onKeyDown={onKeyDown}
                                        />
                                }
                                <Button variant={'text'} onClick={onNodeText2ConfirmChange}
                                        color={'primary'}
                                >
                                    <TCIcon iconCode={'tci-check'}/>
                                </Button>
                                <Button variant={'text'} onClick={onNodeText2ChangeCancel}
                                        color={'error'}
                                >
                                    <TCIcon iconCode={'tci-cancel'} />
                                </Button>
                            </Box>
                                :
                            <Button variant={'text'} onClick={onSetEditMode}
                                    sx={{mt: -1, mb: -1, pt: 0, pb: 0, minWidth: 0, textTransform: 'none'}}
                            >
                                {props.data?.text2}
                            </Button>
                        )
                        :
                            props.data?.text2
                    }

                </Box>
                : null}
    </Box>;
};
