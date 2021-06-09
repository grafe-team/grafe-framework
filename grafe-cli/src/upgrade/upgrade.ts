import * as yargs from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import * as pkgDir from 'pkg-dir';
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
    return yargs;
}

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
    let changes = 0;
    let warnings = 0;

    if (typeof data.tests !== 'boolean') {
        data.tests = false;
        changes++;
    }

    if (Array.isArray(data.statics)) {
        for (let i = 0; i < data.statics.length; i++) {
            if (!('prefix' in data.statics[i] && 'folder' in data.statics[i])) {
                data.statics.splice(i, 1);
                i--;
                changes++;
            }
        }
    } else {
        data.statics = [];
    }

    if (Array.isArray(data.middlewares)) {
        for (let i = 0; i < data.middlewares.length; i++) {
            if (
                !(
                    'name' in data.middlewares[i] &&
                    'description' in data.middlewares[i] &&
                    'value' in data.middlewares[i]
                )
            ) {
                data.middlewares.splice(i, 1);
                i--;
                changes++;
            }
        }
    } else {
        data.middlewares = [];
    }

    if (typeof data.projectType !== 'string') {
        data.projectType = '';
        changes++;
        console.error(messages.type_error, 'PROJECT_TYPE');
    }

    if (!['express'].includes(data.projectType)) {
        console.warn(messages.projectType_warn);
        warnings++;
    }

    if (typeof data.routePath !== 'string') {
        data.routePath = '';
        changes++;
        console.error(messages.type_error, 'ROUTE_PATH');
    }

    if (typeof data.middlewarePath !== 'string') {
        data.routePath = '';
        changes++;
        console.error(messages.type_error, 'MIDDLEWARE_PATH');
    }

    if (changes != 0) {
        fs.writeFileSync(
            path.join(rootDir, 'grafe.json'),
            JSON.stringify(data, null, 4)
        );
        return console.log(messages.update_grafe, changes);
    } else if (warnings != 0) {
        return console.log(messages.warn);
    }

    return console.log(messages.everything_right);
}
