import * as NodeUtil from "./lib/Util";

export let Exec = NodeUtil.CreateNodeExec(
  "bower",
  "bower --version",
  "bower/bin/bower"
);
