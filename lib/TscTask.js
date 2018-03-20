"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = require("path");
const Util = require("./Util");
const Helpers = require("./task/Helpers");
const Command = require("./Command");
const Typescript = require("typescript");
const Task = require("./task/Task");
//The following are the most common types used from typescript for the compiler optionss
exports.ModuleKind = Typescript.ModuleKind;
;
exports.ScriptTarget = Typescript.ScriptTarget;
function TscTask(name, filenames, dependencies, options, emitOptions, excludeExternals) {
    let depInfo = new Command.CommandInfo({
        Name: name,
        Dir: Path.resolve(Util.LocalDir),
        Command: "tsc",
        Inputs: filenames,
        TsConfig: options,
        Dependencies: Task.Task.NormalizeDedpendencies(dependencies)
    });
    return Helpers.FileTask(depInfo.DependencyFile, depInfo.AllDependencies, function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            let emitResult = (emitOptions && emitOptions.programEmit)
                ? emitOptions.programEmit(program)
                : program.emit(undefined, undefined, undefined, undefined, emitOptions && emitOptions.customTransformers);
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
    });
}
exports.TscTask = TscTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHNjVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRzY1Rhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiwwQ0FBMEM7QUFFMUMscUNBQXFDO0FBQ3JDLHlDQUF5QztBQUN6QyxvQ0FBb0M7QUFHcEMsd0ZBQXdGO0FBQzdFLFFBQUEsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFBQSxDQUFDO0FBQ3BDLFFBQUEsWUFBWSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7QUFFbEQsaUJBQ0UsSUFBWSxFQUNWLFNBQW1CLEVBQ25CLFlBQW1DLEVBQ25DLE9BQW1DLEVBQ25DLFdBR0QsRUFDQyxnQkFBMEI7SUFHNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksRUFBRSxJQUFJO1FBQ1YsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNoQyxPQUFPLEVBQUUsS0FBSztRQUNkLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQztLQUM3RCxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUU7O1lBQ3ZFLElBQUksV0FBVyxHQUFHLGVBQWUsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzFELE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFMUIsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0QsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcs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