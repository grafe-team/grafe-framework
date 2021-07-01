
class StaticFolder {
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
     * @returns true if the folder exists.
     */
    public checkFolder(): boolean {
        throw new Error('This method is not implemented jet');
    }
}
