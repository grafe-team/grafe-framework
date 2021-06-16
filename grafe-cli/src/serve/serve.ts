import yargs, { exit } from 'yargs';
import * as chokidar from 'chokidar';
import * as pkgDir from 'pkg-dir';
import * as path from 'path';
import { cat, exec } from 'shelljs';
import { ChildProcess, ChildProcessByStdio, ChildProcessWithoutNullStreams, execFile, execSync, fork, spawn } from 'child_process';
import * as fs from 'fs';
import 'colors';

export function serveCommand(yargs: yargs.Argv<Record<string, unknown>>) {}

export async function serveHandler(argv: Record<string, unknown>) {
    const rootDir = await pkgDir.default(process.cwd());

    let compilerProzess: ChildProcess;

    const compilerPath = path.join(__dirname, 'compiler');

    createBuildDirIfNeeded(rootDir);

    const watchDir = path.join(rootDir, 'src');

    chokidar
        .watch(watchDir, { ignoreInitial: true })
        .on('all', (event, path) => {
            console.log('\n-- Change detected restarting --\n'.green);

            killTask(compilerProzess);

            compilerProzess = execFile(process.argv[0], [compilerPath, rootDir]);

            compilerProzess.stdout.pipe(process.stdout);
            compilerProzess.stderr.pipe(process.stderr);
        });



    compilerProzess = execFile(process.argv[0], [compilerPath, rootDir]);
    compilerProzess.stdout.pipe(process.stdout);
    compilerProzess.stderr.pipe(process.stderr);
}

/**
 * This function kills all the childs of the pid.
 *
 * This code is from nodemon: https://github.com/remy/nodemon/blob/master/lib/monitor/run.js
 *
 * @param childPid The pid where all childs should be killed
 * @return void
 */
function killTask(child: ChildProcess): void {
    // is windows
    if (process.platform === 'win32') {
        // When using CoffeeScript under Windows, child's process is not node.exe
        // Instead coffee.cmd is launched, which launches cmd.exe, which starts
        // node.exe as a child process child.kill() would only kill cmd.exe, not
        // node.exe
        // Therefore we use the Windows taskkill utility to kill the process and all
        // its children (/T for tree).
        // Force kill (/F) the whole child tree (/T) by PID (/PID 123)
        exec('taskkill /pid ' + child.pid + ' /T /F', {silent: true});
    } else if (process.platform === 'darwin') {
        // Mac OS
        child.kill('SIGSTOP');
    } else {
        // Linux
        child.kill('SIGSTOP');
    }
}

/**
 * Looks in the root dir and checks if there is a "build" folder. If there is non it will create one
 */
function createBuildDirIfNeeded(rootDir: string) {
    const buildDirName = "build";
    const files = fs.readdirSync(rootDir);

    let found = false; // if there is a build directory

    files.forEach(file => {
        if (file === buildDirName) {
            const dirSat = fs.statSync(path.join(rootDir, file));

            if (dirSat.isDirectory()) {
                found = true;
            } else {
                throw new Error('Unable to compile. Build file found but it is not a directory!');
            }
        }
    });

    if (!found) {
        fs.mkdirSync(path.join(rootDir, buildDirName));
    }
}
