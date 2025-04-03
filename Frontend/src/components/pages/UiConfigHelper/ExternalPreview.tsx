import React, {useCallback, useEffect, useMemo, useState} from "react";
import {createPortal} from 'react-dom';
import { removeStyles } from "./remove-styles";
import { copyStyles } from "./copy-styles";

interface IExternalWindowProps {
    open?: boolean;
    children: React.ReactNode;
    onClose: () => void;
    styleData: any;
}

export const ExternalPreview: React.FC<IExternalWindowProps> = ({ open, onClose, styleData, children }) => {
    const [newWindow, setNewWindow] = useState<Window | null>(null);
    const containerEl = useMemo(() => {
        if (open) return document.createElement('div');
        return null;
    }, [open]);

    useEffect(() => {
        if (newWindow) {
            removeStyles(newWindow.document);
            copyStyles(document, newWindow.document);
        }
    }, [styleData]);

    const [mainComponentKey, setMainComponentKey] = useState<number>(1);

    useEffect(() => {
        let window1: Window | null = null;
        if (open) {
            // Create a new window
            window1 = window.open('', '', 'width=600,height=400,left=200,top=200');
            setNewWindow(window1);
            if (window1/* && containerEl*/) {
                copyStyles(document, window1.document);
                window1.onbeforeunload = onClose;
            }
        }

        // Cleanup function to close the window when the component unmounts
        return () => {
            if (window1) {
                window1.close();
            }
        };

    }, [open]);


    useEffect(() => {
        if (newWindow && containerEl) {
            newWindow.document.body.appendChild(containerEl);
        }
    }, [newWindow, containerEl]);

    useEffect(() => {
        if (newWindow && containerEl && mainComponentKey === 1) {
            setMainComponentKey(2)
        }
    }, [newWindow, containerEl, mainComponentKey]);


    return newWindow && containerEl && mainComponentKey === 2 ? createPortal(children, containerEl) : null;
};
