"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Fse = require("fs-extra");
const Jakets = require("../lib/Jakets");
const Jakets_1 = require("../lib/Jakets");
let Here = Jakets.PathResolverFrom(__dirname);
let d = Jakets.DirectoryTask(Jakets.BuildDir + "/test/d");
let CreateFileAction = function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Fse.writeFileSync(this.GetName(), `Testfile: ${this.GetName()} ${Jakets.CurrentPackageVersion}`, { encoding: "utf8", });
        this.Log(`Generated file ${this.GetName()}`, 0);
    });
};
let f1 = Jakets.FileTask(`${d.GetName()}/f1.txt`, [d], CreateFileAction);
let f2 = Jakets.FileTask(`${d.GetName()}/f2.txt`, [d, Here(__filename)], CreateFileAction);
let LocalAction = function () {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        this.Log(`Running task ${this.GetName()}`, 0);
    });
};
let t1 = Jakets.Task("local", [f1], LocalAction);
let t2 = Jakets.Task("local", [f2]).Action(LocalAction);
let t3 = Jakets.Task("dedup_test", [], () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let sammplePath = './node_modules/@test/jake';
    yield Fse.copy('./node_modules/jake', sammplePath);
    yield Fse.copy('./node_modules/jake', './node_modules/@test/duped/' + sammplePath);
    let deduped = Jakets_1.Dedup(["@test"]);
    console.log("deduped", deduped);
}));
let global = Jakets.GlobalTaskNs("top", "jtstest", [t1, t3], () => tslib_1.__awaiter(this, void 0, void 0, function* () { return t2.Invoke(); }));
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
Jakets.Log(`name: ${Jakets.CurrentPackageName}`);
Jakets.Log(`version: ${Jakets.CurrentPackageVersion}`);
// if (
//   Jakets.IsWorkingDir(__dirname) ||
//   !Jakets.IsWorkingDir(__dirname + "/..")
// ) {
//   throw "Incorrect IsWorkingDir";
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFrZWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWtlZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnQ0FBZ0M7QUFDaEMsd0NBQXdDO0FBQ3hDLDBDQUFzQztBQUV0QyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFOUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDO0FBRTFELElBQUksZ0JBQWdCLEdBQXNCOztRQUN4QyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxhQUFhLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxNQUFNLENBQUMscUJBQXFCLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3hILElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FBQSxDQUFDO0FBRUYsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUN6RSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUUzRixJQUFJLFdBQVcsR0FBc0I7O1FBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7Q0FBQSxDQUFBO0FBRUQsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNqRCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBRXhELElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxHQUFTLEVBQUU7SUFDaEQsSUFBSSxXQUFXLEdBQUcsMkJBQTJCLENBQUE7SUFDN0MsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSw2QkFBNkIsR0FBRyxXQUFXLENBQUMsQ0FBQztJQUNuRixJQUFJLE9BQU8sR0FBRyxjQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBUyxFQUFFLHdEQUFDLE9BQUEsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBLEdBQUEsQ0FBQyxDQUFDO0FBRXpFLFFBQUEsT0FBTyxHQUFHLE1BQU07S0FDMUIsVUFBVSxDQUFDLFVBQVUsQ0FBQztLQUN0QixTQUFTLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUMxQixXQUFXLENBQUMsa0JBQWtCLENBQUM7S0FDL0IsTUFBTSxDQUFDOztRQUNOLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQU8sU0FBUyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQUEsQ0FBQyxDQUNEO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7QUFFdkQsT0FBTztBQUNQLHNDQUFzQztBQUN0Qyw0Q0FBNEM7QUFDNUMsTUFBTTtBQUNOLG9DQUFvQztBQUNwQyxJQUFJIn0=