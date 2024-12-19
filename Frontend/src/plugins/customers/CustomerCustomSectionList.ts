import type {IEntityCustomSection} from "./IEntityCustomSection";

export const CustomerCustomSectionList: IEntityCustomSection[] = [
    {
        name: "MainDefinitions1",
        groupName: "main_definitions",
        label: "Main definitions 1 modified",
        xs: 12,
        lg: 6,
        fields: [
            {
                "name" : "FirstName",
                "componentType" : "wdHidden",
                "fieldName" : "FirstName",
                "label" : ""
            },
            {
                "name" : "Description2",
                "componentType" : "wdTextbox",
                "fieldName" : "Description",
                "label" : "Last name 2"
            }
        ]
    },
    {
        name: "MainDefinitions1-2",
        groupName: "main_definitions",
        label: "Main definitions 1.5",
        index: 2,
        xs: 12,
        lg: 6,
        fields: [
            {
                "name" : "ValidFrom",
                "componentType" : "wdDatePicker",
                "fieldName" : "ValidFrom",
                "label" : "Valid from"
            },
            {
                "name" : "ValidTo",
                "componentType" : "wdDatePicker",
                "fieldName" : "ValidTo",
                "label" : "Valid up to"
            },
        ]
    },
    {
        name: "TestSection",
        groupName: "TEST",
        label: "Test section 1",
        xs: 12,
        lg: 6,
        fields: [
            {
                "name" : "CardType",
                "componentType" : "wdCombobox",
                "fieldName" : "CardType",
                "label" : "Card type",
                "multiSelect" : false,
/*
                "internalList" : [
                    {
                        "value" : 1,
                        "displayValue" : "Credit"
                    },
                    {
                        "value" : 2,
                        "displayValue" : "Prepayment"
                    },
                    {
                        "value" : 3,
                        "displayValue" : "Prepayment and credit"
                    },
                    {
                        "value" : 4,
                        "displayValue" : "Credit and prepayment"
                    },
                    {
                        "value" : 5,
                        "displayValue" : "Identification only"
                    }
                ]
*/
            },
            {
                "name" : "BalanceOnCard",
                "componentType" : "wdCheckbox",
                "fieldName" : "BalanceOnCard",
                "label" : "Balance on card"
            },
        ]
    },
    {
        name: "CustomSection1",
        groupName: "TEST",
        label: "Custom section 1 - By hand",
        xs: 12,
        lg: 6,
        component: "CustomSectionTest1"
    },
    {
        name: "CustomSection2",
        groupName: "TEST",
        label: "Custom section 2 - By hand no standard",
        xs: 12,
        lg: 6,
        component: "CustomSectionTest2"
    }
];