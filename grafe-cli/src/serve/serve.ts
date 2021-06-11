import yargs from "yargs";
import * as chokidar from 'chokidar';
import * as pkgDir from 'pkg-dir';
import * as path from 'path';
import { cat, exec } from "shelljs";
import { ChildProcess, execSync, spawn } from "child_process";
import * as fs from 'fs';
import 'colors';

let activeProcess: ChildProcess;

export function serveCommand(yargs: yargs.Argv<Record<string, unknown>>) {

}

export async function serveHandler(argv: Record<string, unknown>) {
    const rootDir = await pkgDir.default(process.cwd());

    console.log(`root dir is: ${rootDir}`);
    const watchDir = path.join(rootDir, 'src');
    console.log(`watch dir is: ${watchDir}`);

    chokidar.watch(watchDir, {ignoreInitial: true}).on('all', (event, path) => {
        console.log(`event: ${event}`);
        console.log(`path: ${path}`);

        compile(rootDir);
    });

    compile(rootDir);
}

export function compile(rootDir: string) {
    if (activeProcess && !activeProcess.killed) {
        process.kill(activeProcess.pid);
    }

    try {
        const deleteDirectory = path.join(rootDir, 'build');
        console.log(`removing files from "${deleteDirectory}" directory.`);
        removeEverythingFromDir(deleteDirectory);
    } catch (error) {
        console.error(`There was an error in the cleansing stage: ${error}`.red);
    }

    try {
        console.log(`compiling useing npm command`);
        exec('npm run build', {
            cwd: rootDir,
        });
    } catch (error) {
        console.error(`There was an error in the compiling stage: ${error}`.red);
    }

    try {
        console.log(`starting backend in async mode ${rootDir}`);
        activeProcess = exec('npm run start', {
            cwd: rootDir,
            async: true
        });

    } catch (error) {
        console.error(`There was an error in the running stage: ${error}`.red);
    }

}

export function removeEverythingFromDir(dir: string) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            fs.unlinkSync(filePath);
        } else if (stats.isDirectory()) {
            // node 14.x   
            if (typeof fs.rmSync === 'function') {
                fs.rmSync(filePath, {recursive: true, force: true});
            } else {
                // node 12.x
                fs.rmdirSync(filePath, {recursive: true});
            }
        }
    });
}
