import { app } from "./app.js";
import { startService } from "./routes/server.js";

let port = 7777;
if (Deno.args.length > 0) {
  const lastArgument = Deno.args[Deno.args.length - 1];
  port = Number(lastArgument);
}

app.listen({ port: port });
startService()