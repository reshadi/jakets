/// <reference path="./ExternalTypings.d.ts" />

export const LogLevel: number = parseInt(process.env.LogLevel) || 0;

export function Log(msg, level: number = 1) {
  if (level <= LogLevel) {
    console.log(msg);
  }
}

Log("Logging level is " + LogLevel, 2);
