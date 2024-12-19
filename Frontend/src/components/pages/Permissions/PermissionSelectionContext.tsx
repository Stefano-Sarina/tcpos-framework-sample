import {createContext} from "react";
import type {SelectionState} from "./TreeSelectionStore";

export const PermissionSelectionContext = createContext<SelectionState[string]>([]);