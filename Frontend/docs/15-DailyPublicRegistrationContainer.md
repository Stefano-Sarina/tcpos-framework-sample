# NextBOPublicRegistrationContainer class

This class provides some method for registrations and resolutions.

# register method****

Class registration method (allows one registration for an abstract class). Both the abstract class and
the registered class must be decorated as @PublicInjectable. You must provide an abstract class and the 
corresponding registered class.

Example:

```
import {
    NextBOPublicRegistrationContainer,
} from "@tcpos/backoffice-core";

//...

NextBOPublicRegistrationContainer.register(ALocalizationService, LocalizationService);
```

# resolve method

Method to resolve a registered class starting from an abstract class.

Example:

```
import {
    NextBOPublicRegistrationContainer,
} from "@tcpos/backoffice-core";

//...

const apiClient = NextBOPublicRegistrationContainer.resolve(ANextBOApiClient);
```

# registerEntry method

Method to register a new entry in the list of entries of the container. It can be used to register:
- different entries under the same name (_key_)
- different objects in a single entry

First of all, it's necessary to extend the _@tcpos/common-core_ module adding the _RegistrationEntries_ 
interface containing a RegistrationEntry for each key; this RegistrationEntry receive as generic parameter
an interface which lists the entries to register.

For example, the _@tcpos/backoffice-core_ package provides the _dataControllers_ and _objectControllers_
entries:

```
declare module "@tcpos/common-core" {

    interface RegistrationEntries {
        dataControllers: RegistrationEntry<IDataControllerRegistration<any>>
        objectControllers: RegistrationEntry<IObjectControllerRegistration<any>>
    }
}

export {};

```

The _dataControllers_ key is associated to the _IDataControllerRegistration_ interface:

```
import type {ClassDefinition, EntityType, IEntryRegistrationPayload, IPayloadBase} from "@tcpos/common-core";
import type {ADataController} from "../api_controllers";

export interface IDataControllerRegistration<T extends IPayloadBase> extends IEntryRegistrationPayload{
    controller: ClassDefinition<ADataController<EntityType<T>>>;
}
```

In this way, it is possible to register many classes implementing the same abstract class 
_ADataController_ under the name "dataControllers" as follows:

```
import {
    NextBOPublicRegistrationContainer,
} from "@tcpos/backoffice-core";
import {createRegistrationEntry} from "@tcpos/common-core";

//...

NextBOPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "CostCenters", controller: CostCenterDataController}));
```

It is recommended to use the _createRegistrationEntry_ function as second parameter. This function
accepts a (unique) registration name and __one or more__ registration items, according to the 
interface specified in _RegistrationEntries_.

# resolveEntry method

This method allows resolving a registration entry. Following the example in the previous section,
we can use the _isBound_ method to check if there is a registration with a given name, then we can 
resolve the entry providing the registration key and the registration name; it is very important
to be aware that the result of this method is an object of _RegistrationEntries_ type; the 
needed classes must be extracted and, if it's necessary to create a "New" instance of any of them,
the _resolveConstructor_ must be used.

Following the previous example, the resolution can be:
```
const objectControllerRegistration = NextBOPublicRegistrationContainer.isBound( "objectControllers", objectName)
        ? NextBOPublicRegistrationContainer.resolveEntry("objectControllers",  objectName).controller
        : undefined;

const objectController = () => {
    if (objectControllerRegistration) {
        return NextBOPublicRegistrationContainer.resolveConstructor(objectControllerRegistration) as AERObjectController;
    } else {
        return undefined;
    }
};

```

# updateEntry method

This method allows replacing a registration.

# inject method

This method allows injecting the registered entry in the constructor of a class.

# isBound method

This method returns true if a registration exists. In case of registration executed by the _registerEntry_ 
method, it accepts an entry key and a registration name (see the example in the _resolveEntry_ method 
description).



