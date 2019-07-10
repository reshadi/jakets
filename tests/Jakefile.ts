import * as Fse from "fs-extra";
import * as Jakets from "../lib/Jakets";
import { Dedup } from '../lib/Jakets';

let Here = Jakets.PathResolverFrom(__dirname);

let d = Jakets.DirectoryTask(Jakets.BuildDir + "/test/d");

let CreateFileAction: Jakets.TaskAction = async function () {
  Fse.writeFileSync(this.GetName(), `Testfile: ${this.GetName()} ${Jakets.CurrentPackageVersion}`, { encoding: "utf8", });
  this.Log(`Generated file ${this.GetName()}`, 0);
};

let f1 = Jakets.FileTask(`${d.GetName()}/f1.txt`, [d], CreateFileAction);
let f2 = Jakets.FileTask(`${d.GetName()}/f2.txt`, [d, Here(__filename)], CreateFileAction);

let LocalAction: Jakets.TaskAction = async function () {
  this.Log(`Running task ${this.GetName()}`, 0);
}

let t1 = Jakets.Task("local", [f1], LocalAction);
let t2 = Jakets.Task("local", [f2]).Action(LocalAction);

let t3 = Jakets.Task("dedup_test", [], async () => {
  let sammplePath = './node_modules/@test/jake'
  await Fse.copy('./node_modules/jake', sammplePath);
  await Fse.copy('./node_modules/jake', './node_modules/@test/duped/' + sammplePath);
  let deduped = Dedup(["@test"]);
  console.log("deduped", deduped);
});

let global = Jakets.GlobalTaskNs("top", "jtstest", [t1, t3], async () => t2.Invoke());

export const TopTask = Jakets
  .GlobalTask("jts_test")
  .DependsOn(["jtstest:top"])
  .Description("run Jakets tests")
  .Action(async function () {
    await LocalAction.apply(this, <any>arguments);
    this.Log(">>>Finished tests", 0);
  })
  ;

Jakets.Log(`name: ${Jakets.CurrentPackageName}`);
Jakets.Log(`version: ${Jakets.CurrentPackageVersion}`);

// if (
//   Jakets.IsWorkingDir(__dirname) ||
//   !Jakets.IsWorkingDir(__dirname + "/..")
// ) {
//   throw "Incorrect IsWorkingDir";
// }
