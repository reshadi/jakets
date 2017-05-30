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
): FileTask {

  let depInfo = new Command.CommandInfo({
    Name: name,
    Dir: Path.resolve(Util.LocalDir),
    Command: "tsc",
    Files: [],
    TsConfig: options
  }, dependencies);

  return Helpers.FileTask(depInfo.DependencyFile, depInfo.AllDependencies, async function () {
    let program = Typescript.createProgram(filenames, options);
    let emitResult = program.emit();

    depInfo.Write(program.getSourceFiles().map(f => Util.MakeRelativeToWorkingDir(f.fileName)));

    let allDiagnostics = Typescript.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      let message = Typescript.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);
    this.Log(2);
  });
}

