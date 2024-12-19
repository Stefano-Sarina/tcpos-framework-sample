import React, {useEffect} from "react";
import {useParams, useSearchParams} from "react-router-dom";
import {useEntityContext} from "./EntityContext";
import {type ABaseObjectController, type EntityType, rwModes} from "@tcpos/common-core";
import {EntityCRUDWrapper} from "./EntityCRUDWrapper";
import {EntityMainComponent} from "./EntityMainComponent";

export const EntityPage = () => {
    const {objectId} = useParams();
    const {entityName, lang} = useParams();
    const [urlParams] = useSearchParams();
    const rwMode = urlParams.get('mode');
    const ver = urlParams.get('ver');
    const entityContext = useEntityContext();


    useEffect(() => {
        // The rwMode property is drilled down to subcomponents. It is also stored in a context to have it available.
        if (entityContext.setEntityMode) {
            entityContext.setEntityMode( !rwMode || rwMode === "R" ? rwModes.R : rwModes.W);
        }
    }, [rwMode]);

    return <EntityCRUDWrapper
            objectId={objectId ?? ""}
            objectName={entityName ?? ""}
            rwMode={!rwMode || rwMode === "R" ? rwModes.R : rwModes.W}
            standardRenderer={EntityMainComponent}
            ver={ver ?? undefined}
    />;

};