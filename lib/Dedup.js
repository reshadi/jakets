"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fse = require("fs-extra");
const Path = require("path");
const Log_1 = require("./Log");
const Util_1 = require("./Util");
/**
 * Usually after full installation, npm still leaves duplicate modules in the node_modules folder
 * This function tries to remove the repeated ones that are deep in the hierarchy.
 * This functions list of deleted folders
 */
function Dedup(folders) {
    let files = new jake.FileList();
    files.include(folders.map(scope => `./node_modules/${scope}/**/package.json`));
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
            if (original.name !== repeat.name && original.version !== repeat.version) {
                Log_1.Log(`in compatible but similar packages found at ${value} & ${key}`, 0);
            }
            else {
                let delFolder = Path.dirname(key);
                Log_1.Log(`Removing ${delFolder}`, 0);
                Fse.removeSync(delFolder);
                deletedFolders.push(delFolder);
            }
        }
    });
    return deletedFolders;
}
exports.Dedup = Dedup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVkdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEZWR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdDQUFnQztBQUNoQyw2QkFBNkI7QUFDN0IsK0JBQTRCO0FBQzVCLGlDQUFrQztBQUVsQzs7OztHQUlHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLE9BQWlCO0lBQ3JDLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2hDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGtCQUFrQixLQUFLLGtCQUFrQixDQUFDLENBQUMsQ0FBQztJQUMvRSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDL0IsSUFBSSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUN0QyxJQUFJLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztJQUM5QyxJQUFJLGNBQWMsR0FBYSxFQUFFLENBQUM7SUFDbEMsS0FBSyxJQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7UUFDekIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0QyxTQUFHLENBQUMsbURBQW1ELElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ25FO1FBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3QyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDYixhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDN0M7YUFBTTtZQUNMLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7S0FDRjtJQUNELGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDbkMsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzVCLHdEQUF3RDtZQUN4RCxJQUFJLFFBQVEsR0FBRyxlQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsSUFBSSxNQUFNLEdBQUcsZUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDeEUsU0FBRyxDQUFDLCtDQUErQyxLQUFLLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDekU7aUJBQU07Z0JBQ0wsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEMsU0FBRyxDQUFDLFlBQVksU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzFCLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDaEM7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxjQUFjLENBQUM7QUFDeEIsQ0FBQztBQWxDRCxzQkFrQ0MifQ==