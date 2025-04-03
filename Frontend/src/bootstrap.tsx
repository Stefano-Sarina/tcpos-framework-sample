import React from "react";

import {createRoot} from 'react-dom/client';
import {FullApp} from "./components";

const renderPage = () => {
    const container:Element|null = document.getElementById('root');
    if (!container){
        throw new Error("container not found");
    }
    const root = createRoot(container);
    const strict = true;
    const StrictComp = strict? React.StrictMode:React.Fragment;
    root.render(
            <StrictComp>
                <FullApp />
            </StrictComp>
    );
};

if (/complete|interactive|loaded/.test(document.readyState)) {
    // In case the document has finished parsing, document's readyState will
    // be one of "complete", "interactive" or (non-standard) "loaded".
    renderPage();
} else {
    window.addEventListener("DOMContentLoaded", renderPage, false);
}

