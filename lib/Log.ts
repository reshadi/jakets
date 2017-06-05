/// <reference path="./ExternalTypings.d.ts" />

let LogLevel: number = parseInt(process.env.logLevel) || 0;

export function Log(msg, level: number = 1) {
  if (level <= LogLevel) {
    console.log(msg);
  }
}

Log("Logging level is " + LogLevel, 2);
