import * as yargs from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import * as pkgDir from 'pkg-dir';
import * as inquirer from 'inquirer';
import messages from './upgrade.messages';
import { GrafeConfig } from '../grafe.config';

/**
 * Describes the syntax of the start command
 *
 * @param yargs Yargs object to add information to
 * @returns The same Yargs object
 */
export function upgradeCommand(
    yargs: yargs.Argv<Record<string, unknown>>
): yargs.Argv<Record<string, unknown>> {
    return yargs.option('fix', {
        type: 'boolean',
        description: messages.commands.fix.description,
    });
}

/**
 * Checks the grafe.json and applies changes if needed
 *
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
export async function upgradeHandler(
    argv: Record<string, unknown>
): Promise<void> {
    // get root directory (where package.json is in)
    const rootDir = await pkgDir.default(process.cwd());

    // check if the project is a grafe project
    let raw;
    try {
        raw = fs.readFileSync(path.join(rootDir, '/grafe.json'));
    } catch (err) {
        return console.error(messages.not_grafe);
    }

    const data: GrafeConfig = JSON.parse(raw.toString());

    // integer to add up  all changes / issues
    let changes = 0;
    // integer to add up all warnings
    let warnings = 0;

    // check if the test key is a boolean / not undefined
    if (typeof data.tests !== 'boolean') {
        // if yes then set it to false
        data.tests = false;
        console.error(messages.type_error, 'TESTS');
        // increase issues
        changes++;
    }

    // check if statics value is array
    if (Array.isArray(data.statics)) {
        // loop through every object in the array
        for (let i = 0; i < data.statics.length; i++) {
            // check if object has this two keys
            if (!('prefix' in data.statics[i] && 'folder' in data.statics[i])) {
                // if not log error, remove it and increase changes
                console.error(messages.array_error, 'STATICS');
                data.statics.splice(i, 1);
                i--;
                changes++;
            }
        }
    } else {
        // if not log error, increase changes and set it to empty array
        console.error(messages.type_error, 'STATICS-ARRAY');
        changes++;
        data.statics = [];
    }

    // check if middlewares value is array
    if (Array.isArray(data.middlewares)) {
        // loop through every object in the array
        for (let i = 0; i < data.middlewares.length; i++) {
            // check if object has this two keys
            if (
                !(
                    'name' in data.middlewares[i] &&
                    'description' in data.middlewares[i] &&
                    'value' in data.middlewares[i]
                )
            ) {
                // if not log error, remove it and increase changes
                console.error(messages.array_error, 'MIDDLEWARES');
                data.middlewares.splice(i, 1);
                i--;
                changes++;
            }
        }
    } else {
        // if not log error, increase changes and set it to empty array
        console.error(messages.type_error, 'MIDDLEWARES-ARRAY');
        changes++;
        data.middlewares = [];
    }

    // check if project type is string
    if (typeof data.projectType !== 'string') {
        // if not set it to empty string, log error and increase changes
        data.projectType = '';
        changes++;
        console.error(messages.type_error, 'PROJECT_TYPE');
    }

    // check if project type is one of the supported types
    if (!['express'].includes(data.projectType)) {
        // if not warn user and increase warnings
        console.warn(messages.projectType_warn);
        warnings++;
    }

    // check if routepath is string
    if (typeof data.routePath !== 'string') {
        // if not set it to empty string, log error and increase changes
        data.routePath = '';
        changes++;
        console.error(messages.type_error, 'ROUTE_PATH');
    }

    // check if routepath is empty
    if (data.routePath.length == 0) {
        // if empty log warning and increase warnings
        warnings++;
        console.warn(messages.length_0_warn, 'ROUTE_PATH');
    }

    // check if middlewarepath is string
    if (typeof data.middlewarePath !== 'string') {
        // if not set it to empty string, log error and increase changes
        data.middlewarePath = '';
        changes++;
        console.error(messages.type_error, 'MIDDLEWARE_PATH');
    }

    // check if middlewarepath is empty
    if (data.middlewarePath.length == 0) {
        // if empty log warning and increase warnings
        warnings++;
        console.warn(messages.length_0_warn, 'MIDDLEWARE_PATH');
    }

    // check if there are any changes to make
    if (changes != 0) {
        // tell the user how many issues there are
        console.log(messages.issue_info, changes);

        let answers = [];

        // check if user started command with --fix
        if (!Boolean(argv.fix)) {
            // if not prompt question
            answers = await inquirer.prompt([
                {
                    message: messages.confirm,
                    type: 'confirm',
                    name: 'confirm',
                },
            ]);
        }

        // use either the confirmation of the answers or the args (depends on which is undefined)
        answers.confirm = answers.confirm || argv.fix;

        // if confirmed write all changes into the file and tell the user
        if (answers.confirm) {
            fs.writeFileSync(
                path.join(rootDir, 'grafe.json'),
                JSON.stringify(data, null, 4)
            );
            return console.log(messages.update_grafe, changes);
        }
    } else if (warnings != 0) {
        // if there are any warnings tell the user
        return console.log(messages.warn);
    }

    // if there are neither warnongs or changes tell the user it is right
    return console.log(messages.everything_right);
}
