"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Fse = require("fs-extra");
const Path = require("path");
const Log_1 = require("./Log");
const Util_1 = require("./Util");
const Helpers_1 = require("./task/Helpers");
/**
 * Usually after full installation, npm still leaves duplicate modules in the node_modules folder
 * This function tries to remove the repeated ones that are deep in the hierarchy.
 * This functions list of deleted folders
 */
function Dedup(folders) {
    let files = new jake.FileList();
    files.include(folders.filter(f => Fse.existsSync(`./node_modules/${f}`)).map(f => `./node_modules/${f}/**/package.json`));
    let allFiles = files.toArray();
    let normalModules = new Set();
    let repeatModules = new Map();
    let deletedFolders = [];
    for (let file of allFiles) {
        if (file.indexOf("node_modules") !== 0) {
            Log_1.Log(`ERROR! expected node_modules at the begining of ${file}`, 0);
        }
        let index = file.lastIndexOf("node_modules");
        if (index > 0) {
            repeatModules.set(file, file.substr(index));
        }
        else {
            normalModules.add(file);
        }
    }
    repeatModules.forEach((value, key) => {
        if (normalModules.has(value)) {
            //Key is potentially repeate of value and can be removed
            let original = Util_1.LoadJson(value);
            let repeat = Util_1.LoadJson(key);
            let originalFullname = `${original.name}@${original.version}`;
            let repeatFullname = `${repeat.name}@${repeat.version}`;
            let description = `found\n\`-- ${originalFullname} at ${value}:\n\`-- ${repeatFullname} at ${key}:`;
            if (original.name !== repeat.name) {
                Log_1.Log(`incompatible package names ${description}`, 0);
            }
            else if (original.version !== repeat.version) {
                Log_1.Log(`incompatible package versions ${description}`, 0);
            }
            else {
                Log_1.Log(`compatible packages ${description}`, 0);
                let delFolder = Path.dirname(key);
                Log_1.Log(`Keeping ${Path.dirname(value)}\n\`-- deduping ${delFolder}`, 0);
                Fse.removeSync(delFolder);
                deletedFolders.push(delFolder);
            }
        }
    });
    return deletedFolders;
}
exports.Dedup = Dedup;
Helpers_1.GlobalTaskNs("dedup", "jts", [], function (...folders) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Dedup(folders);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVkdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEZWR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnQ0FBZ0M7QUFDaEMsNkJBQTZCO0FBQzdCLCtCQUE0QjtBQUM1QixpQ0FBa0M7QUFDbEMsNENBQThDO0FBRTlDOzs7O0dBSUc7QUFDSCxTQUFnQixLQUFLLENBQUMsT0FBaUI7SUFDckMsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDaEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztJQUMxSCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDL0IsSUFBSSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUN0QyxJQUFJLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztJQUM5QyxJQUFJLGNBQWMsR0FBYSxFQUFFLENBQUM7SUFDbEMsS0FBSyxJQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7UUFDekIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0QyxTQUFHLENBQUMsbURBQW1ELElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ25FO1FBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3QyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDYixhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDN0M7YUFBTTtZQUNMLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7S0FDRjtJQUNELGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDbkMsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzVCLHdEQUF3RDtZQUN4RCxJQUFJLFFBQVEsR0FBRyxlQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsSUFBSSxNQUFNLEdBQUcsZUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTNCLElBQUksZ0JBQWdCLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM5RCxJQUFJLGNBQWMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hELElBQUksV0FBVyxHQUFHLGVBQWUsZ0JBQWdCLE9BQU8sS0FBSyxXQUFXLGNBQWMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUNwRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDakMsU0FBRyxDQUFDLDhCQUE4QixXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNyRDtpQkFBTSxJQUFJLFFBQVEsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDOUMsU0FBRyxDQUFDLGlDQUFpQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN4RDtpQkFBTTtnQkFDTCxTQUFHLENBQUMsdUJBQXVCLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNsQyxTQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzFCLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDaEM7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxjQUFjLENBQUM7QUFDeEIsQ0FBQztBQXpDRCxzQkF5Q0M7QUFFRCxzQkFBWSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFVBQWdCLEdBQUcsT0FBaUI7O1FBQ25FLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQixDQUFDO0NBQUEsQ0FBQyxDQUFDIn0=