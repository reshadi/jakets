import * as Path from "path";
import * as Util from "./Util";
import * as Helpers from "./task/Helpers";
import * as Exec from "./Exec";
import * as Command from "./Command";
import * as Typescript from "typescript";
import * as Task from "./task/Task";
import { FileTask } from "./task/FileTask";

//The following are the most common types used from typescript for the compiler optionss
export let ModuleKind = Typescript.ModuleKind;;
export let ScriptTarget = Typescript.ScriptTarget;

export function TscTask(
  name: string
  , filenames: string[]
  , dependencies: Task.TaskDependencies
  , options: Typescript.CompilerOptions
  , excludeExternals?: boolean
): FileTask {

  let depInfo = new Command.CommandInfo({
    Name: name,
    Dir: Path.resolve(Util.LocalDir),
    Command: "tsc",
    Inputs: filenames,
    TsConfig: options,
    Dependencies: Task.Task.NormalizeDedpendencies(dependencies)
  });

  return Helpers.FileTask(depInfo.DependencyFile, depInfo.AllDependencies, async function () {
    let sectionName = `tsc compile ${depInfo.DependencyFile}`;
    console.time(sectionName);

    let program = Typescript.createProgram(filenames, options);
    let allFilenames = program.getSourceFiles().map(f => Util.MakeRelativeToWorkingDir(f.fileName));
    if (!excludeExternals) {
      program = Typescript.createProgram(allFilenames, options);
      if (allFilenames.length !== program.getSourceFiles().length) {
        let newAllFilenames = program.getSourceFiles().map(f => Util.MakeRelativeToWorkingDir(f.fileName));
        let diff1 = allFilenames.filter(f => newAllFilenames.indexOf(f) === -1);
        let diff2 = newAllFilenames.filter(f => allFilenames.indexOf(f) === -1);
        this.Log(`
WARNING: Unexpected new source files discovered when compiling
>^^ top files
${filenames.join("\n")}
>-- reachable files removed
${diff1.join("\n")}
>++ reachable files added
${diff2.join("\n")}
`, 0);
        // process.exit(1); //Only report but still try to compile!
      }
    }

    let emitResult = program.emit();
    let outputs = emitResult && emitResult.emittedFiles && emitResult.emittedFiles.map(Util.MakeRelativeToWorkingDir);

    let allDiagnostics = Typescript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
      let message = Typescript.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        message = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
      }
      console.warn(message);
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    this.Log(`Process exiting with code '${exitCode}'.`, 1);

    console.timeEnd(sectionName);

    if (exitCode > 0) {
      const msg = `>> TypeScript compilation failed for ${name}`;
      this.Log(msg, 0);
      process.exit(exitCode);
      // fail(msg, exitCode); //End the whole compilation
      // throw msg;
    }
    depInfo.Write(allFilenames, outputs);
  });
}

