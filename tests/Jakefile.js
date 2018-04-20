"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Fs = require("fs");
const Jakets = require("../lib/Jakets");
let MakeRelative = Jakets.CreateMakeRelative(__dirname);
let d = Jakets.DirectoryTask(Jakets.BuildDir + "/test/d");
let CreateFileAction = function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Fs.writeFileSync(this.GetName(), `Testfile: ${this.GetName()} ${Jakets.CurrentPackageVersion}`, { encoding: "utf8", });
        this.Log(`Generated file ${this.GetName()}`, 0);
    });
};
let f1 = Jakets.FileTask(`${d.GetName()}/f1.txt`, [d], CreateFileAction);
let f2 = Jakets.FileTask(`${d.GetName()}/f2.txt`, [d, MakeRelative(__filename)], CreateFileAction);
let LocalAction = function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        this.Log(`Running task ${this.GetName()}`, 0);
    });
};
let t1 = Jakets.Task("local", [f1], LocalAction);
let t2 = Jakets.Task("local", [f2]).Action(LocalAction);
let global = Jakets.GlobalTaskNs("top", "jtstest", [t1], () => tslib_1.__awaiter(this, void 0, void 0, function* () { return t2.Invoke(); }));
exports.TopTask = Jakets
    .GlobalTask("jts_test")
    .DependsOn(["jtstest:top"])
    .Description("run Jakets tests")
    .Action(function () {
    return tslib_1.__awaiter(this, arguments, void 0, function* () {
        yield LocalAction.apply(this, arguments);
        this.Log(">>>Finished tests", 0);
    });
});
console.log(`name: ${Jakets.CurrentPackageName}`);
console.log(`version: ${Jakets.CurrentPackageVersion}`);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5QkFBeUI7QUFDekIsd0NBQXdDO0FBRXhDLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUV4RCxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFFMUQsSUFBSSxnQkFBZ0IsR0FBc0I7O1FBQ3hDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDdkgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUFBLENBQUM7QUFFRixJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3pFLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBRW5HLElBQUksV0FBVyxHQUFzQjs7UUFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUFBLENBQUE7QUFFRCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ2pELElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFeEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBUyxFQUFFLHdEQUFDLE9BQUEsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBLEdBQUEsQ0FBQyxDQUFDO0FBRXJFLFFBQUEsT0FBTyxHQUFHLE1BQU07S0FDMUIsVUFBVSxDQUFDLFVBQVUsQ0FBQztLQUN0QixTQUFTLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUMxQixXQUFXLENBQUMsa0JBQWtCLENBQUM7S0FDL0IsTUFBTSxDQUFDOztRQUNOLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQUEsQ0FBQyxDQUNEO0FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7QUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMifQ==