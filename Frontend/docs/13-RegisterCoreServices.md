# Core services registration

The registerCoreServices function registers the following services:
- LocalizationService
- CacheLogic, which satisfies ACacheLogic
- UserLogic}, which satisfies AUserLogic
- CommonApiController, which satisfies ABaseApiController
- Data controllers (that map database tables), extending CommonDataController
- Object controllers (one for each application page), extending CommonObjectController

