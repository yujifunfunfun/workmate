import { createClient } from "@libsql/client";


export const storageClient = createClient({
  url: "file:../../.db/storage.db",
});
