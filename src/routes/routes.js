import { Router } from "../deps.js";
import * as controller from "./server.js";

const router = new Router();

router.get("/", controller.showMain);

export { router };
