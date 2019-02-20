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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVkdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEZWR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdDQUFnQztBQUNoQyw2QkFBNkI7QUFDN0IsK0JBQTRCO0FBQzVCLGlDQUFrQztBQUVsQzs7OztHQUlHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLE9BQWlCO0lBQ3JDLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2hDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7SUFDMUgsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQy9CLElBQUksYUFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFDdEMsSUFBSSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7SUFDOUMsSUFBSSxjQUFjLEdBQWEsRUFBRSxDQUFDO0lBQ2xDLEtBQUssSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO1FBQ3pCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDdEMsU0FBRyxDQUFDLG1EQUFtRCxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNuRTtRQUNELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDN0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQzdDO2FBQU07WUFDTCxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO0tBQ0Y7SUFDRCxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ25DLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1Qix3REFBd0Q7WUFDeEQsSUFBSSxRQUFRLEdBQUcsZUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLElBQUksTUFBTSxHQUFHLGVBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsT0FBTyxLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ3hFLFNBQUcsQ0FBQywrQ0FBK0MsS0FBSyxNQUFNLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3pFO2lCQUFNO2dCQUNMLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xDLFNBQUcsQ0FBQyxZQUFZLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMxQixjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sY0FBYyxDQUFDO0FBQ3hCLENBQUM7QUFsQ0Qsc0JBa0NDIn0=