#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChildProcess = require("child_process");
require("jake");
const Log_1 = require("../lib/Log");
const Util = require("../lib/Util");
// jake.run.apply(jake, ["-t", "--jakefile", Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`), `jts:setup`]);
var args = process.argv.slice(2);
if (args.indexOf("jts:setup") === -1 && args.indexOf("--skip-setup") === -1) {
    let command = `npx jake` /* require.resolve(".bin/jake") */ + ` --trace --jakefile ${Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`)} jts:setup`;
    Log_1.Log(command, 0);
    let setup = ChildProcess.execSync(command);
    Log_1.Log(setup && setup.toString(), 0);
    // Exec.Exec(`jake -t --jakefile ${Util.MakeRelativeToWorkingDir(`${__dirname}/../Jakefile.js`)} jts:setup`, () => { }, true);
}
jake.run.apply(jake, args);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDhDQUE4QztBQUM5QyxnQkFBYztBQUVkLG9DQUFpQztBQUNqQyxvQ0FBb0M7QUFNcEMseUhBQXlIO0FBRXpILElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0lBQzNFLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxrQ0FBa0MsR0FBRyx1QkFBdUIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsU0FBUyxpQkFBaUIsQ0FBQyxZQUFZLENBQUM7SUFDOUosU0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoQixJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLFNBQUcsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLDhIQUE4SDtDQUMvSDtBQUNELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyJ9