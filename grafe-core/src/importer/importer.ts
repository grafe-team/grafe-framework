import { ComponentConfigStore } from "../components/componentConfigStore";
import { GrafeLogger } from "../logger/logger";

class UnsupportedExtensionError extends Error {
    public constructor(extension: string) {
        super(`Unsupported extension "${extension}" detected!`);
    }
}

/**
 * 
 */
export class Importer {

    public constructor(protected logger: GrafeLogger) {}

    public importModule(modulePath: string): any[] {
        // Safe the the file extension of the file we should import
        // if there is not file extension an empty string should be safed
        // so we can check later if the user has the correct extensions.
        // props to https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504
        const fileExtension = modulePath.slice(
            ((modulePath.lastIndexOf('.') - 1) >>> 0) + 2
        );

        // now check that the user did not try and import a file with a file extension
        // because it will only confuse the user. They should only include files without an extension
        // because they code in .ts files but we need to import the .js files
        // we only suppport .ts and .js extension. If there is a nother extension
        // we will throw an error and abort.
        if (fileExtension !== '') {
            if (fileExtension !== 'ts' && fileExtension !== 'js') {
                throw new UnsupportedExtensionError(`.${fileExtension}`);
            }

            this.logger.warn(
                `.${fileExtension} ending detected. Please import routes without an ending!`
            );

            // remove the file extension because we expect no file extension
            modulePath = modulePath.replace(`.${fileExtension}`, '');
        }

        modulePath += '.js';

        this.logger.debug('Starting to import Route: ' + modulePath);

        const classes = this.getClassNamesFromNamespace(this.require(modulePath));

        const configs: any[] = [];

        classes.forEach(className => {
            const config = ComponentConfigStore.getInstance().getConfigOf(className)

            if (config !== undefined) {
                configs.push(config);
            }
        });

        return configs;
    }

    /**
     * This function is a wrapper around *require* it only exists
     * for moking purposes
     * @param path
     * @returns
     */
    private require(path: string): any {
        return require(path);
    }

    private getClassNamesFromNamespace(namespace: any): string[] {
        const classNames: string[] = [];
        Object.keys(namespace).forEach((key) => {
            if (typeof namespace[key].prototype === 'object') {
                classNames.push(key);
            }
        });
        return classNames;
    }

}
