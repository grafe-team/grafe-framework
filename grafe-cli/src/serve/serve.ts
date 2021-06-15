import yargs, { exit } from 'yargs';
import * as chokidar from 'chokidar';
import * as pkgDir from 'pkg-dir';
import * as path from 'path';
import { cat, exec } from 'shelljs';
import { ChildProcess, ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import * as fs from 'fs';
import 'colors';
import { executionAsyncResource } from 'async_hooks';

let activeProcess: ChildProcess;

let stopOperation: boolean;
let currentlyCompiling: boolean;

export function serveCommand(yargs: yargs.Argv<Record<string, unknown>>) {}

export async function serveHandler(argv: Record<string, unknown>) {
    const rootDir = await pkgDir.default(process.cwd());

    createBuildDirIfNeeded(rootDir);

    const watchDir = path.join(rootDir, 'src');

    chokidar
        .watch(watchDir, { ignoreInitial: true })
        .on('all', (event, path) => {
            console.log('\n-- Change detected restarting --\n'.green);

            compile(rootDir);
        });

    compile(rootDir);
}

/**
 * Starts the compiling process. It first deletes everything from the build folder. After that it 
 * starts the Typescript compiler and compiles. After the compiler finished it starts the backend.
 * 
 * This code needs improvemnt and a lot of it...like really a lot
 * @param rootDir The root directory of the project
 */
async function compile(rootDir: string) {
    if (currentlyCompiling) { // if there is another compiling process running currently
        stopOperation = true;
    } else {
        stopOperation = false;
    }

    currentlyCompiling = true;

    if (activeProcess && !activeProcess.killed) {
        killTask(activeProcess);
    }

    try {
        const deleteDirectory = path.join(rootDir, 'build');
        console.log('\n-- Cleaning build directory --\n'.green);
        removeEverythingFromDir(deleteDirectory);
    } catch (error) {
        console.error(
            `\nThere was an error in the cleaning stage: ${error}\n`.red
        );
        return;
    }

    if (stopOperation) {
        return;
    }

    try {
        console.log(`\n-- Compiling code --\n`.green);
        const code = await compileCode(rootDir);

        if (code !== 0) {
            console.error(`\n-- There was an error during compiling. Additional information should be above! Compiler finished with code ${code} --\n`.red);
            return;
        }

    } catch (error) {
        console.error(
            `\nThere was an error in the compiling stage: ${error}\n`.red
        );
        return;
    }

    if (stopOperation) {
        return;
    }

    try {
        console.log(`\n-- Starting project --\n`.green);
        activeProcess = exec('node build/index.js', {
            cwd: rootDir,
            async: true,
        });
    } catch (error) {
        console.error(`\nThere was an error in the running stage: ${error}\n`.red);
        return;
    }

    currentlyCompiling = false;
    stopOperation = false;
}

function removeEverythingFromDir(dir: string) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            fs.unlinkSync(filePath);
        } else if (stats.isDirectory()) {
            // node 14.x
            if (typeof fs.rmSync === 'function') {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else {
                // node 12.x
                fs.rmdirSync(filePath, { recursive: true });
            }
        }
    });
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
        child.kill('SIGTERM');
    } else {
        // Linux
        child.kill('SIGTERM');
    }
}

async function compileCode(rootDir: string) {

    return new Promise<number>((res, rej) => {
        let compiler: ChildProcessWithoutNullStreams; 
        
        compiler = spawn('tsc', {
            cwd: rootDir,
            shell: true
        });

        compiler.on('error', async error => {

            // @ts-ignore
            if (error.code === 'ENOENT') {

                console.warn('\n-- Unable to find Typescript globally. Falling back to using `npm run build` --'.yellow);

                try {
                    res(await compileCodeUsingNodeModules(rootDir));
                } catch(error) {
                    rej(error);
                }
            }
        });
        
        compiler.stdout.on('data', data => {
            console.log(`${data}`);
        });
        
        compiler.stderr.on('data', data => {
            console.log(`${data}`);
        });

        compiler.on('exit', code => {
            res(code);
        })
    });
}

async function compileCodeUsingNodeModules(rootDir: string): Promise<number> {
    return new Promise<number>((res, rej) => {
        const child = exec('npm run build', {
            cwd: rootDir,
        });

        res(child.code);
    });
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
            } {
                throw new Error('Unable to compile. Build file found but it is not a directory!');
            }
        }
    });

    if (!found) {
        fs.mkdirSync(path.join(rootDir, buildDirName));
    }
}
