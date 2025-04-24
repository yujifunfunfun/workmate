// src/server/index.ts
function registerApiRoute(path, options) {
  if (path.startsWith("/api/")) {
    throw new Error(`Path must not start with "/api", it's reserved for internal API routes`);
  }
  return {
    path,
    method: options.method,
    handler: options.handler,
    openapi: options.openapi,
    middleware: options.middleware
  };
}

export { registerApiRoute };
