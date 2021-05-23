import * as fs from 'fs';
import * as path from 'path';

export interface FileInfo {
    path: string;
    name: string;
    isDirectory: Boolean;
    isFile: Boolean;
}

/**
 * Reads the given directory and returns alle the children in the directory. It returns wether this child is a file or another directory
 * @param dirPath absolut path to the dir that should be read
 * @returns FileInfo Array
 */
export function readAllFilesStats(dirPath: string): FileInfo[] {
    // get stats of the directory we need to read
    const dirStats = fs.statSync(dirPath);

    // check if the path resolvse to a directory 
    // !throw an error if the path does not resolve to a directory
    if (!dirStats.isDirectory()) {
        throw `Unable to read files of ${dirPath}. Is not a directory!`;
    }

    // get all file/dir names of the directory
    const dir = fs.readdirSync(dirPath);

    // create the result array where all the information is saved in
    const result: FileInfo[] = [];

    // go through every name in the directory
    dir.forEach(fileName => {
        // create the absolut path the the dir/file
        const filePath = path.join(dirPath, fileName);

        // get stats of the path
        const fileStat = fs.statSync(filePath);

        // save the needed data in a temporary object
        const fileInfo = {
            path: filePath,
            isDirectory: fileStat.isDirectory(),
            isFile: fileStat.isFile(),
            name: fileName
        };

        // push the object into the result arrays
        result.push(fileInfo);
    })

    return result;
}

