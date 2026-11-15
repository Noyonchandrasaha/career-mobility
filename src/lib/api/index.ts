import "server-only"
import { createApiContext } from "./context"
import { createApiHandlers } from "./handlers"
export const api = createApiHandlers({ context: createApiContext })
