#!/usr/bin/env node
import "jake";
import * as Util from "../lib/Util";
import * as Exec from "../lib/Exec";

//This is a copy of jake/bin/cli.js, only add the setup to it.
declare namespace jake {
  function run(...args: any[]): void;
}
// jake.run.apply(jake, ["-t", "--jakefile", Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`), `jts:setup`]);

var args = process.argv.slice(2);
if (args.indexOf("jts:setup") === -1) {
  Exec.Exec(`jake -t --jakefile ${Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`)} jts:setup`, () => { }, true);
}
jake.run.apply(jake, args);
