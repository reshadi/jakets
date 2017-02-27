import * as NodeUtil from "./Util";

export let Exec = NodeUtil.CreateNodeExec(
  "bower",
  "bower --version",
  "bower/bin/bower"
);
