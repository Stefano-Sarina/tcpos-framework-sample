import React, {createContext, useContext, useMemo, useState} from "react";
import {rwModes} from "@tcpos/common-core";

export interface EntityContextInterface {
    entityName: string;
    entityMode: rwModes;
    setEntityName?: (name: string) => void;
    setEntityMode?: (mode: rwModes) => void;
}

export const EntityContext = createContext<EntityContextInterface>({entityName: "", entityMode: rwModes.R});

export const EntityContextProvider = ({children}: any) => {
    const [entityName, setEntityName] = useState<string>('');
    const [entityMode, setEntityMode] = useState<rwModes>(rwModes.R);

    const setContextEntityName = (name: string) => {setEntityName(name);};
    const setContextEntityMode = (mode: rwModes) => {setEntityMode(mode);};

    const contextValue = useMemo(() => ({
        entityName,
        entityMode,
        setEntityName: setContextEntityName,
        setEntityMode: setContextEntityMode
    }), [entityName, entityMode,setEntityName, setEntityMode]);
    return (
            <EntityContext.Provider value={contextValue}>
                {children}
            </EntityContext.Provider>
    );
};

export const useEntityContext = () => {
    const context = useContext(EntityContext);
    if (context === undefined) {
        throw new Error("Entity context is outside of its provider.");
    }

    return context;
};
