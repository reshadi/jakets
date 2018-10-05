#!/usr/bin/env node
import "jake";
import * as Util from "../lib/Util";

//This is a copy of jake/bin/cli.js, only add the setup to it.
declare namespace jake {
  function run(...args: any[]): void;
}
jake.run.apply(jake, ["-t", "--jakefile", Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`), `jts:setup`]);

var args = process.argv.slice(2);
jake.run.apply(jake, args);
