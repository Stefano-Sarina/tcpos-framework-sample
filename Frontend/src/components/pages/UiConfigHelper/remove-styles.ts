export const removeStyles = (targetDoc: Document) => {
    Array.from(targetDoc.styleSheets).forEach(styleSheet => {
        if (styleSheet.ownerNode) {
            styleSheet.ownerNode.remove();
        }
    });
};