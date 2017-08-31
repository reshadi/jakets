import * as Fs from "fs";
import * as Path from "path";
import * as Crypto from "crypto";
import * as ChildProcess from "child_process";
import { BuildDir, MakeRelativeToWorkingDir } from "./Util";

export const DepDir = `${BuildDir}/dep`;

export interface CommandData {
  /**Name used for creating the build/dep/Name.json file */
  Name: string;

  /** Directory in which the command was executed */
  Dir?: string;

  /** The actual command that was executed */
  Command?: string;

  /** Extra dependencies that should satisfy before the command runs */
  Dependencies: string[];

  /** The input files of the command */
  Inputs?: string[];

  /** The output files of the command */
  Outputs?: string[];

  /** Any other files of the command */
  Files?: string[];
}

export class CommandInfo<DataType extends CommandData> {
  /** The original command data */
  Data: DataType;

  /** Full file name of json file that captured dependencies */
  DependencyFile: string;

  /** All computed dependencies based on input and previous files/dependencies in the json file */
  AllDependencies: string[];

  constructor(data: DataType) {
    this.Data = data;

    let hash = Crypto.createHash("sha1");
    hash.update(JSON.stringify(data));
    let value = hash.digest("hex");
    this.DependencyFile = `${DepDir}/${data.Name}_${value}.json`;

    //In case data.name had some / in it, we need to re-calculate the dir
    let depDir = Path.dirname(this.DependencyFile);
    directory(depDir);

    this.AllDependencies = [depDir].concat(data.Dependencies);
    this.Read();
  }

  private Read() {
    if (Fs.existsSync(this.DependencyFile)) {
      let depStr: string = Fs.readFileSync(this.DependencyFile, 'utf8');
      try {
        let dep = <CommandData>JSON.parse(depStr);
        let previousDependencies = dep.Dependencies.concat(dep.Inputs).concat(dep.Outputs).concat(dep.Files);
        let existingDependencies = previousDependencies.filter(d => d && Fs.existsSync(d));
        this.AllDependencies = this.AllDependencies.concat(existingDependencies);
      } catch (e) {
        console.error(`Regenerating the invalid dep file: ${this.DependencyFile}`);
        Fs.unlinkSync(this.DependencyFile);
        // this.AllDependencies = [];
      }
    }
  }

  Write(inputs?: string[], outputs?: string[], files?: string[]) {
    if (inputs) {
      this.Data.Inputs = inputs;
    }

    if (outputs) {
      this.Data.Outputs = outputs;
    }

    if (files) {
      this.Data.Files = files;
    }

    Fs.writeFileSync(this.DependencyFile, JSON.stringify(this.Data, null, ' '));
  }
}

export function ExtractFilesAndUpdateDependencyInfo<T extends CommandData>(cmdInfo: CommandInfo<T>, error, stdout: string, stderror) {
  if (error) {
    console.error(`
${error}
${stdout}
${stderror}`);
    throw error;
  }

  let files =
    stdout
      .split("\n")
      .map(f => f.trim())
      .filter(f => !!f)
      .map(f => MakeRelativeToWorkingDir(f));
  cmdInfo.Write(files);
}