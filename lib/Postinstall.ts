import * as Path from "path";
import * as Fs from "fs";
import * as Util from "./Util";
import { Log } from "./Log";
import { ExecAsync } from "./Exec";

async function PostInstall() {
  let topInitDir = process && process.env && process.env.INIT_CWD;
  if (topInitDir) {
    try {
      const topPackageJson = Path.join(topInitDir, "package.json");
      Log(`looking for jakets commands in ${topPackageJson}`, 0);
      let pkg = Util.LoadJson<{
        scripts?: {
          "jakets:setup"?: string;
          "jakets:build"?: string;
          "jakets"?: string;
        }
      }>(topPackageJson);
      const scripts = pkg.scripts = pkg.scripts || {};
      const runJaketsSetup = `jake -t --jakefile ${Util.MakeRelativeToBaseDir(topInitDir, Path.join(Util.LocalDir, "Jakefile.js"))} jts:setup`;
      const runJaketsBuild = `jake -t --jakefile Jakefile.js`;
      const runJakets = `npm run jakets:setup && npm run jakets:build`;

      function CheckAndSet(fieldName: keyof Required<typeof pkg>["scripts"], value: string): boolean {
        if (scripts[fieldName] !== value) {
          scripts[fieldName] = value;
          return true;
        } else {
          return false;
        }
      }

      if (
        [
          CheckAndSet("jakets:setup", runJaketsSetup),
          CheckAndSet("jakets:build", runJaketsBuild),
          CheckAndSet("jakets", runJakets)
        ].some(needSave => needSave)
      ) {
        Log(`Updating jakets commands in ${topPackageJson}`, 0);
        Fs.writeFileSync(topPackageJson, JSON.stringify(pkg, null, "  "));
      }
      return ExecAsync(`touch ${Path.join(topInitDir, Util.NodeModulesUpdateIndicator)} `);
    } finally {
    }
  }
}

PostInstall();
