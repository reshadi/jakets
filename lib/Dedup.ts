import * as Fse from "fs-extra";
import * as Path from "path";
import { Log } from './Log';
import { LoadJson } from './Util';

/**
 * Usually after full installation, npm still leaves duplicate modules in the node_modules folder
 * This function tries to remove the repeated ones that are deep in the hierarchy.
 * This functions list of deleted folders
 */
export function Dedup(folders: string[]): string[] {
  let files = new jake.FileList();
  files.include(folders.map(scope => `./node_modules/${scope}/**/package.json`));
  let allFiles = files.toArray();
  let normalModules = new Set<string>();
  let repeatModules = new Map<string, string>();
  let deletedFolders: string[] = [];
  for (let file of allFiles) {
    if (file.indexOf("node_modules") !== 0) {
      Log(`ERROR! expected node_modules at the begining of ${file}`, 0);
    }
    let index = file.lastIndexOf("node_modules");
    if (index > 0) {
      repeatModules.set(file, file.substr(index));
    } else {
      normalModules.add(file);
    }
  }
  repeatModules.forEach((value, key) => {
    if (normalModules.has(value)) {
      //Key is potentially repeate of value and can be removed
      let original = LoadJson(value);
      let repeat = LoadJson(key);
      if (original.name !== repeat.name && original.version !== repeat.version) {
        Log(`in compatible but similar packages found at ${value} & ${key}`, 0);
      } else {
        let delFolder = Path.dirname(key);
        Log(`Removing ${delFolder}`, 0);
        Fse.removeSync(delFolder);
        deletedFolders.push(delFolder);
      }
    }
  });
  return deletedFolders;
}
