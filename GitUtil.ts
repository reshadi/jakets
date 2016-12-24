import * as ChildProcess from "child_process";
import * as Semver from "semver";

import * as Jake from "./Jake";
import * as Util from "./Util";

function GetVersionChangeInfo(callback: (version: { Current: string; Previous: string; }) => void) {
  ChildProcess.exec("git diff HEAD~1 -- package.json", (error, stdout, stderr) => {
    if (!error) {
      const GetVersion = (pattern: RegExp, str: string) => {
        let match = pattern.exec(str);
        return match && match[0];
      }
      let prevVersion = GetVersion(/-\s*"version"\s*:\s*"([^"]*)"/, stdout);
      let currVersion = GetVersion(/+\s*"version"\s*:\s*"([^"]*)"/, stdout);
      callback({ Current: currVersion, Previous: prevVersion });
    }
  });
}

interface IVersion {
  Hash: string;
  Version: string;
}
interface IRange extends IVersion {
  MaxVersion?: IVersion;
}

function UpdateVersionRangeTags(callback: () => void) {
  Jake.Log(Util.LocalDir, 0);
  // "git tag -l"
  ChildProcess.exec("git show-ref --tags", { cwd: Util.LocalDir }, (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    Jake.Log(stdout, 0);
    const tagInfo = stdout.split("\n");
    const GitTagPattern = /^([0-9a-z]*) refs\/tags\/(.*)/;

    let hashes = new Map<string, string>();
    let versions: string[] = [];
    let ranges: string[] = [];

    for (let tagStr of tagInfo) {
      let match = GitTagPattern.exec(tagStr);
      if (match) {
        let [_, hash, version] = match;
        if (Semver.valid(version)) {
          versions.push(version);
          hashes.set(version, hash);
        } else if (Semver.validRange(version)) {
          ranges.push(version);
          hashes.set(version, hash);
        }
      }
    }

    for (let version of versions) {
      let range: string;
      for (let r of ranges) {
        if (Semver.satisfies(version, r)) {
          range = r;
          break;
        }
      }
      if (!range) {
        range = `v${Semver.major(version)}.x.x`;
        ranges.push(range);
      }
    }

    let cmds: string[] = [];
    for (let range of ranges) {
      let maxVer = Semver.maxSatisfying(versions, range);
      if (hashes.get(range) !== hashes.get(maxVer)) {
        cmds.push(`git tag -f ${range} ${maxVer}`);
      }
    }
    Jake.Log([versions, ranges, cmds], 0);
    Jake.Exec(cmds, callback);
  });
}

task("update_version_range_tags", function () {
  UpdateVersionRangeTags(() => this.complete());
}, { async: true });