#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jake");
const Util = require("../lib/Util");
const Exec = require("../lib/Exec");
// jake.run.apply(jake, ["-t", "--jakefile", Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`), `jts:setup`]);
var args = process.argv.slice(2);
if (args.indexOf("jts:setup") === -1) {
    Exec.Exec(`jake -t --jakefile ${Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`)} jts:setup`, () => { }, true);
}
jake.run.apply(jake, args);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGdCQUFjO0FBQ2Qsb0NBQW9DO0FBQ3BDLG9DQUFvQztBQU1wQyx5SEFBeUg7QUFFekgsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLFNBQVMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUM1SDtBQUNELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyJ9