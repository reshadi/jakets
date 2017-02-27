"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const Util = require("./Util");
const Jake = require("./Jake");
const Command_1 = require("./Command");
exports.Exec = Util.CreateNodeExec("tsc", "tsc --version ", "typescript/lib/tsc.js");
function TscTask(name, dependencies, command, excludeExternal) {
    command += " --listFiles --noEmitOnError";
    if (!excludeExternal) {
        command += " --baseUrl ./node_modules";
    }
    let depInfo = new Command_1.CommandInfo({
        Name: name,
        Dir: Path.resolve(Util.LocalDir),
        Command: command,
        Dependencies: dependencies,
        Files: []
    });
    file(depInfo.DependencyFile, depInfo.AllDependencies, function () {
        exports.Exec(command, (error, stdout, stderror) => {
            Command_1.ExtractFilesAndUpdateDependencyInfo(depInfo, error, stdout, stderror);
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
        }, true);
    }, { async: true });
    return depInfo.DependencyFile;
}
exports.TscTask = TscTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHNjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVHNjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiwrQkFBK0I7QUFDL0IsdUNBQTZFO0FBRWxFLFFBQUEsSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQ25DLEtBQUssRUFDTCxnQkFBZ0IsRUFDaEIsdUJBQXVCLENBQ3hCLENBQUM7QUFFRixpQkFBd0IsSUFBWSxFQUFFLFlBQXNCLEVBQUUsT0FBZSxFQUFFLGVBQXlCO0lBQ3RHLE9BQU8sSUFBSSw4QkFBOEIsQ0FBQztJQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDckIsT0FBTyxJQUFJLDJCQUEyQixDQUFDO0lBQ3pDLENBQUM7SUFFRCxJQUFJLE9BQU8sR0FBRyxJQUFJLHFCQUFXLENBQUM7UUFDNUIsSUFBSSxFQUFFLElBQUk7UUFDVixHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2hDLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFlBQVksRUFBRSxZQUFZO1FBQzFCLEtBQUssRUFBRSxFQUFFO0tBQ1YsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGVBQWUsRUFBRTtRQUNwRCxZQUFJLENBQ0YsT0FBTyxFQUNMLENBQUMsS0FBSyxFQUFFLE1BQWMsRUFBRSxRQUFRO1lBQ2hDLDZDQUFtQyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3RFLHlCQUF5QjtZQUN6QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEIsS0FBSztZQUNMLDBCQUEwQjtZQUMxQixxREFBcUQ7WUFDckQsNkRBQTZEO1lBQzdELDZEQUE2RDtZQUM3RCxtQ0FBbUM7WUFDbkMsb0VBQW9FO1lBQ3BFLCtCQUErQjtZQUMvQixRQUFRO1lBQ1Isb0JBQW9CO1lBQ3BCLFFBQVE7WUFDUiwyREFBMkQ7WUFDM0QsV0FBVztZQUNYLGdCQUFnQjtZQUNoQixJQUFJO1FBQ04sQ0FBQyxFQUNDLElBQUksQ0FDUCxDQUFDO0lBQ0osQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDcEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7QUFDaEMsQ0FBQztBQTFDRCwwQkEwQ0MifQ==