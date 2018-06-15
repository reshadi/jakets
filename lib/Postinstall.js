"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = require("path");
const Fs = require("fs");
const Util = require("./Util");
const Log_1 = require("./Log");
const Exec_1 = require("./Exec");
function PostInstall() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let topInitDir = process && process.env && process.env.INIT_CWD;
        if (topInitDir) {
            try {
                const topPackageJson = Path.join(topInitDir, "package.json");
                Log_1.Log(`looking for jakets commands in ${topPackageJson}`, 0);
                let pkg = Util.LoadJson(topPackageJson);
                const scripts = pkg.scripts = pkg.scripts || {};
                const runJaketsSetup = `jake --jakefile ${Util.MakeRelativeToBaseDir(topInitDir, Path.join(Util.LocalDir, "Jakefile.js"))} jts:setup`;
                const runJaketsBuild = `jake --jakefile Jakefile.js`;
                const runJakets = `npm run jakets:setup && npm run jakets:build`;
                function CheckAndSet(fieldName, value) {
                    if (scripts[fieldName] !== value) {
                        scripts[fieldName] = value;
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                if ([
                    CheckAndSet("jakets:setup", runJaketsSetup),
                    CheckAndSet("jakets:build", runJaketsBuild),
                    CheckAndSet("jakets", runJakets)
                ].some(needSave => needSave)) {
                    Log_1.Log(`Updating jakets commands in ${topPackageJson}`, 0);
                    Fs.writeFileSync(topPackageJson, JSON.stringify(pkg, null, "  "));
                }
                return Exec_1.ExecAsync(`touch ${Path.join(topInitDir, Util.NodeModulesUpdateIndicator)} `);
            }
            finally {
            }
        }
    });
}
PostInstall();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdGluc3RhbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0aW5zdGFsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLCtCQUErQjtBQUMvQiwrQkFBNEI7QUFDNUIsaUNBQW1DO0FBRW5DOztRQUNFLElBQUksVUFBVSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQ2hFLElBQUksVUFBVSxFQUFFO1lBQ2QsSUFBSTtnQkFDRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDN0QsU0FBRyxDQUFDLGtDQUFrQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FNcEIsY0FBYyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7Z0JBQ2hELE1BQU0sY0FBYyxHQUFHLG1CQUFtQixJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQyxZQUFZLENBQUM7Z0JBQ3RJLE1BQU0sY0FBYyxHQUFHLDZCQUE2QixDQUFDO2dCQUNyRCxNQUFNLFNBQVMsR0FBRyw4Q0FBOEMsQ0FBQztnQkFFakUscUJBQXFCLFNBQWdELEVBQUUsS0FBYTtvQkFDbEYsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxFQUFFO3dCQUNoQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDO3dCQUMzQixPQUFPLElBQUksQ0FBQztxQkFDYjt5QkFBTTt3QkFDTCxPQUFPLEtBQUssQ0FBQztxQkFDZDtnQkFDSCxDQUFDO2dCQUVELElBQ0U7b0JBQ0UsV0FBVyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUM7b0JBQzNDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsY0FBYyxDQUFDO29CQUMzQyxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQztpQkFDakMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDNUI7b0JBQ0EsU0FBRyxDQUFDLCtCQUErQixjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDeEQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ25FO2dCQUNELE9BQU8sZ0JBQVMsQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0RjtvQkFBUzthQUNUO1NBQ0Y7SUFDSCxDQUFDO0NBQUE7QUFFRCxXQUFXLEVBQUUsQ0FBQyJ9