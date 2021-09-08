import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config';

export class StaticFolder {
    public constructor(folder: string, private config: Config, prefix?: string) {
        this.folder = folder;
        this.prefix = prefix;
    }

    /**
     * The path to the folder where the static content is hosted.
     *
     * For example: /opt/static
     */
    public folder: string;

    /**
     * What prefix should be used when the static folder is registered.
     *
     * This string will be placed before every file that can be downloaded using this folder.
     *
     * @example
     *
     * If you have the file: README.md
     * and you have the prefix as: static
     *
     * than you can download the readme under: /static/README.md
     */
    public prefix: string;

    /**
     * Checks if "folder" points to an existing folder.
     *
     * @returns true if the folder exists and is a directory
     */
    public checkFolder(): boolean {
        const folderPath = path.join(this.config.projectBase, this.folder);

        if (!fs.existsSync(folderPath)) {
            this.config.logger.debug(`Path "${folderPath}" does not exist!`);
            return false;
        }
        
        if (!fs.statSync(folderPath).isDirectory()) {
            this.config.logger.debug(`Path "${folderPath}" is not a directory!`);
            return false;
        }

        return true;
    }
}
