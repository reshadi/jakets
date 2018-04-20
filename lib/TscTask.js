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
                    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHNjVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRzY1Rhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiwwQ0FBMEM7QUFFMUMscUNBQXFDO0FBQ3JDLHlDQUF5QztBQUN6QyxvQ0FBb0M7QUFHcEMsd0ZBQXdGO0FBQzdFLFFBQUEsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFBQSxDQUFDO0FBQ3BDLFFBQUEsWUFBWSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7QUFFbEQsaUJBQ0UsSUFBWSxFQUNWLFNBQW1CLEVBQ25CLFlBQW1DLEVBQ25DLE9BQW1DLEVBQ25DLFdBR0QsRUFDQyxnQkFBMEI7SUFHNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksRUFBRSxJQUFJO1FBQ1YsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNoQyxPQUFPLEVBQUUsS0FBSztRQUNkLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQztLQUM3RCxDQUFDLENBQUM7SUFFSCxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsZUFBZSxFQUFFOztZQUN2RSxJQUFJLFdBQVcsR0FBRyxlQUFlLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMxRCxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTFCLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzNELElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMs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