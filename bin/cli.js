#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChildProcess = require("child_process");
require("jake");
const Path = require("path");
const Log_1 = require("../lib/Log");
const Util = require("../lib/Util");
// jake.run.apply(jake, ["-t", "--jakefile", Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`), `jts:setup`]);
var args = process.argv.slice(2);
if (args.indexOf("jts:setup") === -1 && args.indexOf("--skip-setup") === -1) {
    let command = Path.join("node_modules", ".bin", "jake") + ` -t --jakefile ${Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`)} jts:setup`;
    Log_1.Log(command, 0);
    let setup = ChildProcess.execSync(command);
    Log_1.Log(setup && setup.toString(), 0);
    // Exec.Exec(`jake -t --jakefile ${Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`)} jts:setup`, () => { }, true);
}
jake.run.apply(jake, args);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDhDQUE4QztBQUM5QyxnQkFBYztBQUNkLDZCQUE2QjtBQUM3QixvQ0FBaUM7QUFDakMsb0NBQW9DO0FBTXBDLHlIQUF5SDtBQUV6SCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtJQUMzRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsa0JBQWtCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLFNBQVMsaUJBQWlCLENBQUMsWUFBWSxDQUFDO0lBQ3JKLFNBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEIsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQyxTQUFHLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNsQyw4SEFBOEg7Q0FDL0g7QUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==