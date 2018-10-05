#!/usr/bin/env node
import * as ChildProcess from "child_process";
import "jake";
import * as Path from "path";
import { Log } from "../lib/Log";
import * as Util from "../lib/Util";

//This is a copy of jake/bin/cli.js, only add the setup to it.
declare namespace jake {
  function run(...args: any[]): void;
}
// jake.run.apply(jake, ["-t", "--jakefile", Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`), `jts:setup`]);

var args = process.argv.slice(2);
if (args.indexOf("jts:setup") === -1) {
  let command = Path.join("node_modules", ".bin", "jake") + ` -t --jakefile ${Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`)} jts:setup`;
  Log(command, 0);
  let setup = ChildProcess.execSync(command);
  Log(setup && setup.toString(), 0);
  // Exec.Exec(`jake -t --jakefile ${Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`)} jts:setup`, () => { }, true);
}
jake.run.apply(jake, args);
