import { createAction, createReducer } from "@reduxjs/toolkit";

export const Actions = {
    ADD_SELECTED: createAction<{ type: string, ids: (string | number)[] }>("ADD_SELECTED"),
    REMOVE_SELECTED: createAction<{ type: string, ids: (string | number)[] }>("REMOVE_SELECTED"),
    CLEAR_ALL: createAction<{ type: string }>("CLEAR_ALL"),
    SET_ALL: createAction<{ type: string, ids: (string | number)[] }>("SET_ALL"),
};

export type SelectionState = {
    [key: string]: (string | number)[]|undefined;
};

const initialState: SelectionState = {};

export const TreeSelectionStore = createReducer(initialState, builder => {
    builder.addCase(Actions.ADD_SELECTED, (state, action) => {
        const { type, ids } = action.payload;
        let stateElement = state[type];
        if (!stateElement) {
            stateElement=state[type] = [];
        }
        for (const id of ids) {
            if (!stateElement.includes(id)) {
                stateElement.push(id);
            }
        }
    });

    builder.addCase(Actions.REMOVE_SELECTED, (state, action) => {
        const { type, ids } = action.payload;
        if (state[type]) {
            state[type] = state[type]?.filter(id => !ids.includes(id));
        }
    });

    builder.addCase(Actions.CLEAR_ALL, (state, action) => {
        const { type } = action.payload;
        if (state[type]) {
            state[type] = [];
        }
    });

    builder.addCase(Actions.SET_ALL, (state, action) => {
        const { type, ids } = action.payload;
        state[type] = ids;
    });
});
