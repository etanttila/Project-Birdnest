import { app } from "./app.js";
import { startService } from "./routes/server.js";

app.listen({ port: 7777 });
startService()
