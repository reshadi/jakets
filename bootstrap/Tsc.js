"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHNjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVHNjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLCtCQUErQjtBQUMvQix1Q0FBNkU7QUFFbEUsUUFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FDbkMsS0FBSyxFQUNMLGdCQUFnQixFQUNoQix1QkFBdUIsQ0FDeEIsQ0FBQztBQUVGLGlCQUF3QixJQUFZLEVBQUUsWUFBc0IsRUFBRSxPQUFlLEVBQUUsZUFBeUI7SUFDdEcsT0FBTyxJQUFJLDhCQUE4QixDQUFDO0lBQzFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNyQixPQUFPLElBQUksMkJBQTJCLENBQUM7SUFDekMsQ0FBQztJQUVELElBQUksT0FBTyxHQUFHLElBQUkscUJBQVcsQ0FBQztRQUM1QixJQUFJLEVBQUUsSUFBSTtRQUNWLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDaEMsT0FBTyxFQUFFLE9BQU87UUFDaEIsWUFBWSxFQUFFLFlBQVk7UUFDMUIsS0FBSyxFQUFFLEVBQUU7S0FDVixDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsZUFBZSxFQUFFO1FBQ3BELFlBQUksQ0FDRixPQUFPLEVBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBYyxFQUFFLFFBQVE7WUFDaEMsNkNBQW1DLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdEUseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QixLQUFLO1lBQ0wsMEJBQTBCO1lBQzFCLHFEQUFxRDtZQUNyRCw2REFBNkQ7WUFDN0QsNkRBQTZEO1lBQzdELG1DQUFtQztZQUNuQyxvRUFBb0U7WUFDcEUsK0JBQStCO1lBQy9CLFFBQVE7WUFDUixvQkFBb0I7WUFDcEIsUUFBUTtZQUNSLDJEQUEyRDtZQUMzRCxXQUFXO1lBQ1gsZ0JBQWdCO1lBQ2hCLElBQUk7UUFDTixDQUFDLEVBQ0MsSUFBSSxDQUNQLENBQUM7SUFDSixDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNwQixNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztBQUNoQyxDQUFDO0FBMUNELDBCQTBDQyJ9