/// <reference path="typings/main/ambient/jake/index.d.ts" />
/// <reference path="typings/main/ambient/shelljs/index.d.ts" />
/// <reference path="typings/main.d.ts" />

/**
 * Creates a Jake TestTask.
 * @name name The name of the Task
 * @param prereqs Prerequisites to be run before this task
 * @param definitions The function to update/add to TestTask members
 */
declare function testTask(name:string, prereqs?:string[], definitions?:()=>void): jake.TestTask;
