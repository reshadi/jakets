import * as Fse from "fs-extra";
import * as Path from "path";
import { Log } from './Log';
import { LoadJson } from './Util';
import { GlobalTaskNs } from './task/Helpers';

/**
 * Usually after full installation, npm still leaves duplicate modules in the node_modules folder
 * This function tries to remove the repeated ones that are deep in the hierarchy.
 * This functions list of deleted folders
 */
export function Dedup(folders: string[]): string[] {
  let files = new jake.FileList();
  files.include(folders.filter(f => Fse.existsSync(`./node_modules/${f}`)).map(f => `./node_modules/${f}/**/package.json`));
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

      let originalFullname = `${original.name}@${original.version}`;
      let repeatFullname = `${repeat.name}@${repeat.version}`;
      let description = `found\n\`-- ${originalFullname} at ${value}:\n\`-- ${repeatFullname} at ${key}:`;
      if (original.name !== repeat.name) {
        Log(`incompatible package names ${description}`, 0);
      } else if (original.version !== repeat.version) {
        Log(`incompatible package versions ${description}`, 0);
      } else {
        Log(`compatible packages ${description}`, 0);
        let delFolder = Path.dirname(key);
        Log(`Keeping ${Path.dirname(value)}\n\`-- deduping ${delFolder}`, 0);
        Fse.removeSync(delFolder);
        deletedFolders.push(delFolder);
      }
    }
  });
  return deletedFolders;
}

GlobalTaskNs("dedup", "jts", [], async function (...folders: string[]) {
  Dedup(folders);
});