# Global Context Providers Folder
## for application-wide state and functionality

This folder stores providers that are used globally across the application.
For feature- or region-specific providers, place them inside that module’s folder.

## Folder structure guideline:
Within providers/, create a subfolder for each module that contains its context files, for example:
```
providers/
├── auth/
│   ├── authContext.ts
│   └── index.ts
├── user/
│   ├── userContext.ts
│   └── index.ts
├── index.ts
```

## Centralized Exports for Providers
To simplify imports across the project, the root providers/index.ts re-exports all contexts from their respective folders.

```
// providers/index.ts

export * from "./auth";
export * from "./user";
export * from "./other";
```



This means in other files, you can import all needed providers like this:

```
// other.ts:

import {authContext, userContext, otherContext } from "src/providers"
```

instead of importing individually from each folder:

```
// other.ts:

import {authContext } from "src/providers/auth"
import {userContext } from "src/providers/user"
import {otherContext } from "src/providers/other"
```