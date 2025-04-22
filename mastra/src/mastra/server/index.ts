import { authRoutes } from "./routes/auth";
import { chatRoutes } from "./routes/chat";
import { memberRoutes } from "./routes/members";
import { userRoutes } from "./routes/users";
import { commonMiddleware } from "./middleware";
import { networksRoutes } from "./routes/networks";


export const configureServer = {
  middleware: commonMiddleware,
  apiRoutes: [
    ...authRoutes,
    ...chatRoutes,
    ...memberRoutes,
    ...userRoutes,
    ...networksRoutes
  ]
};


