/**
 * Convert a two letter language code in a numeric hash code
 * @param languageCode The dictionary language code
 * @return The language code hash code
 */
export const convertLanguageCode2Hash = (languageCode: string) => {
    if (languageCode === '') {
        return 0;
    }

    let hash = 0;
    languageCode = languageCode.toLowerCase();
    // Local language support in the format language (two letters) - country (two letters)
    // e.g. "en-us"
    if (languageCode.includes("-") && languageCode.length == 5) {
        // For local language codes, if it is something like "en-us" the country local
        // is moved in front of the string ("usen"). In this way, the last two bytes
        // are always the same either for "en-us" or for "en-uk" or "en".
        // To make them fit into the field they are shifted by 7 bytes to reduce the
        // resulting number size and not to overflow
        languageCode = languageCode.replace("-", "");
        languageCode = languageCode.substring(2, 2) + languageCode.substring(0, 2);
        for (let i = 0; i < languageCode.length; i++)
        {
            hash = (hash << 7) + languageCode[i].charCodeAt(0);
        }
    } else {
        for (let i = 0; i < languageCode.length; i++)
        {
            hash = (hash << 8) + languageCode[i].charCodeAt(0);
        }
    }
    return hash;
};


/**
 * Convert a numeric language hash code in a two letter language code
 * @param hash The language code hash code
 * @return The dictionary language code
 */
export const convertHash2LanguageCode = (hash: number) => {
    const originalHash = hash;
    let languageCode = "";

    if (hash > 0x7A7A7A) {
        // This is a local language over four bytes
        while (hash > 0) {
            languageCode = String.fromCharCode(hash & 127) + languageCode;
            hash >>= 7;
        }
    } else {
        while (hash > 0)
        {
            languageCode = String.fromCharCode(hash & 255) + languageCode;
            hash >>= 8;
        }
    }

    if (originalHash > 0x7A7A7A)
    {
        languageCode = languageCode.substring(2, 2) + "-" + languageCode.substring(0, 2);
    }
    return languageCode;
};