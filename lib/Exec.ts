import * as ChildProcess from "child_process";
import { Log } from "./Log";

export function Exec(cmd: string | string[], callback, isSilent?: boolean) {
  let cmdArray: string[];
  if (Array.isArray(cmd)) {
    cmdArray = cmd;
  } else {
    cmdArray = [cmd];
  }
  // isSilent || console.log(cmd);
  Log(cmdArray, 0);
  if (isSilent && cmdArray.length === 1) {
    let command = cmdArray[0].trim().replace(/\s\s+/g, ' ').split(' ');
    let executable = command[0];
    let args = command.slice(1);
    let result = ChildProcess.spawnSync(executable, args);
    callback(result.error || (result.status ? `exit code: ${result.status}` : ""), (result.stdout || "").toString(), (result.stderr || "").toString());
  } else {
    jake.exec(cmdArray, callback, { printStdout: true, printStderr: true });
  }
}

interface CmdOutput { StdOut: string; StdErr: string; }

export async function SpawnAsync(cmd: string): Promise<CmdOutput> {
  return new Promise<CmdOutput>((resolve, reject) => {
    Log(cmd, 0);
    Exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ StdOut: stdout, StdErr: stderr });
      }
    });
  });
}

export async function ExecAsync(cmd: string): Promise<CmdOutput> {
  return new Promise<CmdOutput>((resolve, reject) => {
    Log(cmd, 0);
    ChildProcess.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ StdOut: stdout, StdErr: stderr });
      }
    });
  });
}

export async function ExecAsyncAll(cmds: string[], runParallel?: boolean): Promise<CmdOutput[]> {
  if (runParallel) {
    return Promise.all(cmds.map(ExecAsync));
  } else {
    // return cmds.map(async cmd => await ExecAsync(cmd));
    let result: CmdOutput[] = [];
    for (let cmd of cmds) {
      result.push(await ExecAsync(cmd));
    }
    return Promise.resolve(result);
  }
}
