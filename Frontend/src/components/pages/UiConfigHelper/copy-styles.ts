export const copyStyles = (sourceDoc: Document, targetDoc: Document) => {
    Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
        try {
            if (styleSheet.cssRules) { // Check if cssRules is accessible
                const newStyleEl = targetDoc.createElement('style');
                Array.from(styleSheet.cssRules).forEach(cssRule => {
                    newStyleEl.appendChild(targetDoc.createTextNode(cssRule.cssText));
                });

                targetDoc.head.appendChild(newStyleEl);
            } else if (styleSheet.href) {
                // true for stylesheets loaded from a URL
                const newLinkEl = sourceDoc.createElement("link");
                newLinkEl.rel = "stylesheet";
                newLinkEl.href = styleSheet.href;
                targetDoc.head.appendChild(newLinkEl);
            }
        } catch (e) {
            console.log('Error accessing cssRules for stylesheet', styleSheet.href, e);
        }
    });
    //sourceDoc.fonts.forEach(font => {
    //    targetDoc.fonts.add(font);
    //});
};