import { Importer } from '../importer/importer';
import { GrafeLogger } from '../logger/logger';
import { Config } from '../config/config';
import { RoutePart } from './routePart';
import * as fs from 'fs';
import * as path from 'path';

interface FileInfo {
    path: string;
    name: string;
    isDirectory: boolean;
    isFile: boolean;
}

export class RouteTree {

    private root: RoutePart;

    public build(codeBase: string, importer: Importer, logger: GrafeLogger) {
        const stats = this.readAllFileStatsOfDir(codeBase);
    }

    private readAllFileStatsOfDir(dirPath: string) {
        // check if the path supplied resolves to a directory
        const dirStats = fs.statSync(dirPath);

        if (!dirStats.isDirectory()) {
            throw new Error(
                `Unable to read files of ${dirPath}. It is not a directory!`
            );
        }

        const dir = fs.readdirSync(dirPath);

        const result: FileInfo[] = [];

        // read the stats of each file an put them into the FileInfo
        // Format, for easier administration later on.
        dir.forEach((fileName) => {
            const filePath = path.join(dirPath, fileName);

            const fileStat = fs.statSync(filePath);

            const fileInfo = {
                path: filePath,
                isDirectory: fileStat.isDirectory(),
                isFile: fileStat.isFile(),
                name: fileName,
            };

            result.push(fileInfo);
        });

        return result;
    }
}
