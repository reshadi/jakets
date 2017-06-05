import * as Jakets from "./lib/Jakets";
import "./lib/Setup";
import "./lib/GitUtil";

Jakets.GlobalTask("default").Description("Default task");


//The following is kept for backward compatibility and will be removed later
export {Exec as exec} from "./lib/Exec";
// export let shell = Jake.Shell;
export {Log} from "./lib/Log";

import * as Jake from "./lib/Jake";
export let LogTask = Jake.LogTask;
export let AsyncTask = Jake.AsyncTask;
export let AsyncFile = Jake.AsyncFile;

export * from "./lib/Jakets";

import * as Bower from "./Bower";
export let bower = Bower.Exec;

import * as Tsc from "./Tsc";
export let tsc = Tsc.Exec;
export let TscTask = Tsc.TscTask;

import * as Browserify from "./Browserify";
export let browserify = Browserify.Exec;
export let BrowserifyTask = Browserify.BrowserifyTask;

import * as Closure from "./Closure";
export let closure = Closure.Exec;
