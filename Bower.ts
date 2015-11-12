import * as Node from "./Node";

export let Exec = Node.CreateNodeExec(
  "bower",
  "bower --version",
  "bower/bin/bower"
);
