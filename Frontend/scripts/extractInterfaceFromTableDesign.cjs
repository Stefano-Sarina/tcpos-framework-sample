const fs = require('fs');
const path = require('path');

let dirName = './public/config/working_dir';

let fieldList = [];
let datetimeFieldList = [];

const typeConverter = function(sqlType) {
    switch(sqlType) {
        case 'int':
        case 'float':
        case 'numeric':
            return 'number';
        case 'varchar':
        case 'datetime':
            return 'string';
        default:
            return 'unknown';
    }
}

const fieldNameConverter = function(field) {
    return field.split("_").map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(""); // The first match is the field
};

/**
 * Create a line for the typescript interface
 * @param line input line from db script (field description)
 * @return {string} line for the typescript interface
 */
const getField = function(line) {
    // Single line for the interface
    let result = line.match(/(?<=\[).+?(?=])/g); // Extract the substrings surrounded by square brackets
    let fieldName = fieldNameConverter(result[0]); // The first match is the field
    fieldList.push(fieldName);
    let dbType = result[1]; // The second match is the field type
    let newType = typeConverter(dbType); // Convert the type
    if(newType === 'unknown') {
        console.log('Warning: unknown type detected');
    }
    if(dbType === 'datetime') {
        datetimeFieldList.push(fieldName);
    }
    // Return the interface property
    return fieldName + ": " +
        newType +
        (fieldName !== 'id' ? " | null;" : ";") +
        (line.match(/NOT NULL/) ? "// Mandatory" : "") +
        (dbType === 'datetime' ? " // Datetime" : "");
};

/**
 * Default values management
 * @param line input line from db script (alter table - default values)
 * @return {{fieldName: *, value: *}}
 */
const getDefaultValue = function(line) {
    let result = line.match(/(?<=\[).+?(?=])/g); // Extract the substrings surrounded by square brackets
    let fieldName = fieldNameConverter(result[result.length - 1]); // The last match is the field name
    let extractedValue = line.match(/(?<=(DEFAULT \(\()).*(?=\)\))/); // Match the default value surrounded by (( ... ))
    if(!extractedValue) {
        extractedValue = line.match(/(?<=(DEFAULT \()).*(?=\))/); // Match the default value surrounded by ( ... )
    }
    let value = extractedValue[0]; // Default value
    return {fieldName: fieldName, value: value};
};

fs.readdir(dirName, (err, files) => {
    if(!err) {
        const regex = new RegExp("^CREATE TABLE");
        const regexField = new RegExp("^[ \\t]*\\[");
        const regexDefault = new RegExp("ALTER TABLE .* DEFAULT");
        const regexForeignKey = new RegExp("ALTER TABLE .* FOREIGN KEY");
        let newLines = [];
        let defaultValues;
        let fkeys;
        let result = "";
        files.forEach(file => {
            fieldList = [];
            defaultValues = [];
            fkeys = [];
            datetimeFieldList = [];
            newLines = [];
            if(path.extname(file) === '.sql') {
                console.log('Extracting interface from file: ' + file);
                const allFileContents = fs.readFileSync(dirName + "/" + file, 'utf-8');
                let isInFieldList = false;
                allFileContents.split(/\r?\n/).forEach(line => {
                    if(!isInFieldList) {
                        // We are before or after the field list
                        if(regex.test(line)) {
                            // Found "CREATE TABLE": in the next line the field list starts
                            isInFieldList = true;
                        } else {
                            if(regexDefault.test(line)) {
                                // We are after the field list, in a line containing the default value for the field
                                // e.g., "ALTER TABLE [dbo].[customers] ADD  DEFAULT ((1)) FOR [is_valid]"
                                let defaultValue = getDefaultValue(line);
                                newLines[fieldList.indexOf(defaultValue.fieldName)] += " // Default: " + defaultValue.value;
                                defaultValues.push({[defaultValue.fieldName]:  defaultValue.value});
                            }
                            if(regexForeignKey.test(line)) {
                                // We are after the field list, in a line containing the foreign key constraint
                                // e.g., "ALTER TABLE [dbo].[menus]  WITH CHECK ADD  CONSTRAINT [fk_menus_pricelevels] FOREIGN KEY([pricelevel_id])"
                                let foreignKeyField = line.match(/(?<=\[).+?(?=])/g); // Extract the substrings surrounded by square brackets
                                fkeys.push(fieldNameConverter(foreignKeyField[foreignKeyField.length - 1])); // The last match is the field name
                            }
                        }
                    } else {
                        // As long as we have a "[fieldName] [fieldType] ..." line structure, we are in field list
                        if(!regexField.test(line)) {
                            // No longer in field list
                            isInFieldList = false;
                        } else {
                            // Process the line and add it to the resulting array
                            newLines.push(getField(line));
                        }
                    }
                });
                let payloadInterfaceName = "I" + path.basename(file).charAt(0).toUpperCase() +
                    path.basename(file).slice(1).replace('.sql', '') + "Payload";
                result += payloadInterfaceName + " {\r\n";
                newLines.forEach(line => {
                    result += "\t" + line + "\r\n";
                });
                result += "}\r\n\r\n";

                result += `async createNewEntity(initialData: ${payloadInterfaceName} | undefined, id?: number): Promise<LogicResult<${payloadInterfaceName}>> {\r\n`;
                result += "\treturn await super.createNewEntity({\r\n";
                newLines.forEach((line, index) => {
                    if(index === 0) {
                        result += "\t\tId: id ?? -1,\r\n";
                    } else {
                        result += fieldList[index] + ": " +
                            (defaultValues[fieldList[index]] !== undefined ? defaultValues[fieldList[index]] : "null") +
                            ",\r\n";
                    }
                });
                result += "\t}, id);\r\n";
                result += "}\r\n\r\n";

                result += `batchRefFields: (keyof ${payloadInterfaceName})[] = [\r\n`;
                fkeys.forEach(fk => {
                    result += "'" + fk + "',\r\n";
                });
                result += "];\r\n\r\n";

                result += "dateFields: string[] = [\r\n";
                datetimeFieldList.forEach(f => {
                    result += "\t'" + f + "',\r\n";
                });
                result += "];\r\n";
            }
        });
        fs.writeFileSync(dirName + '/result.txt', result);
        console.log("Generated file result.txt");
    }
})