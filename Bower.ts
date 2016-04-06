import * as NodeUtil from "./NodeUtil";

export let Exec = NodeUtil.CreateNodeExec(
  "bower",
  "bower --version",
  "bower/bin/bower"
);
