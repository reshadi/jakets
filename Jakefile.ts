
export * from "./lib/Jakets";

import "./lib/Setup";
import "./lib/GitUtil";

import "./tests/Jakefile";

import { GlobalTask } from "./lib/Jakets";
export const DefaultTask = GlobalTask("default").Description("Default task");
