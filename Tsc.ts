import * as Path from "path";
import * as Util from "./lib/Util";
import * as Jake from "./lib/Jake";
import { CommandInfo, ExtractFilesAndUpdateDependencyInfo } from "./lib/Command";
import { Task } from "./lib/task/Task";

export var Exec = Util.CreateNodeExec(
  "tsc",
  "tsc --version ",
  "typescript/lib/tsc.js"
);

export function TscTask(name: string, dependencies: string[], command: string, excludeExternal?: boolean): string {
  command += " --listFiles --noEmitOnError";
  if (!excludeExternal) {
    command += " --baseUrl ./node_modules";
  }

  let depInfo = new CommandInfo({
    Name: name,
    Dir: Path.resolve(Util.LocalDir),
    Command: command,
    Dependencies: dependencies,
    Files: []
  });

  file(depInfo.DependencyFile, Task.NormalizeDedpendencies(depInfo.AllDependencies), function () {
    Exec(
      command
      , (error, stdout: string, stderror) => {
        ExtractFilesAndUpdateDependencyInfo(depInfo, error, stdout, stderror);
        // let callback = () => {
        this.complete();
        Jake.LogTask(this, 2);
        // };
        // if (!excludeExternal) {
        //   let seenDirs: { [index: string]: number; } = {};
        //   let files = data.files.reverse().filter((f: string) => {
        //     if (/node_modules/.test(f) && !/[.]d[.]ts$/.test(f)) {
        //       let dir = path.dirname(f);
        //       let seenCount = seenDirs[dir] = ((seenDirs[dir] || 0) + 1);
        //       return seenCount <= 5;
        //     }
        //     return false;
        //   });
        //   tsc(command + " " + files.join(" "), callback, false);
        // } else {
        //   callback();
        // }
      }
      , true
    );
  }, { async: true });
  return depInfo.DependencyFile;
}

