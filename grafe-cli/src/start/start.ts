import * as yargs from 'yargs';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import * as templating from '../utils/templating';
import * as spin from 'cli-spinner';
import { spawn } from 'child_process';
import events from 'events';
import messages from './start.messages';

const emitter = new events.EventEmitter();

export interface StarterTemplateOptions {
    templatePath: string; // Path to the template
    templateName: string; // Name of the template
    projectPath: string; // Path to the project of the user
    projectName: string; // Name of the project from the user
}

/**
 * Describes the syntax of the start command
 *
 * @param yarg Yargs object to add information to
 * @returns The same Yargs object
 */
export function startCommand(
    yarg: yargs.Argv<Record<string, unknown>>
): yargs.Argv<Record<string, unknown>> {
    return yarg
        .option('template', {
            alias: 't',
            type: 'string',
            description: messages.commands.start.templating.description,
        })
        .option('testing', {
            type: 'boolean',
            description: messages.commands.start.testing.description,
        })
        .option('yes', {
            type: 'boolean',
            description: messages.commands.confirm.description,
        });
}

/**
 * Hanles the start command. Gets the projectName from the user and lets him select what project he wants to use.
 *
 * @param argv Arguments from Yargs
 * @returns Promise<undefined>
 */
export async function startHandler(
    argv: Record<string, unknown>
): Promise<void> {
    // get project name from the arguments
    let projectName = argv.projectName;

    // if the project name was not provided get it from the user
    if (projectName === undefined || String(projectName).length === 0) {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                message: messages.questions.startHandler.projectName,
                name: 'projectName',
            },
        ]);

        projectName = answers.projectName;
    }

    // create the path to the template starter dir
    const templateStartersPath = path.join(
        __dirname,
        '..',
        '..',
        'templates',
        'starters'
    );

    // get the template the user specified
    const templateType = await getTemplate(templateStartersPath, argv);

    if (!argv.yes) {
        const confirm = await inquirer.prompt({
            message: messages.confirm,
            type: 'confirm',
            name: 'confirm',
        });

        // check if everything is right
        if (!confirm.confirm) {
            return;
        }
    }

    const projectOptions: StarterTemplateOptions = {
        projectName: String(projectName),
        projectPath: path.join(process.cwd(), String(projectName)),
        templateName: templateType,
        templatePath: path.join(templateStartersPath, templateType),
    };

    // create project folder
    if (!createProjectFolder(projectOptions)) {
        return;
    }

    // copy template into projet folder
    templating.createDirectoryContents(
        projectOptions.templatePath,
        projectOptions.projectName,
        projectOptions
    );

    if (argv.testing) {
        let raw;
        try {
            raw = fs.readFileSync(
                path.join(projectOptions.projectPath, 'grafe.json')
            );
        } catch (err) {
            console.error(messages.not_grafe);
            return;
        }

        const data = JSON.parse(raw.toString());

        data.tests = true;
        fs.writeFileSync(
            path.join(projectOptions.projectPath, 'grafe.json'),
            JSON.stringify(data, null, 4)
        );
    }

    // install the node packages
    installPackages(projectOptions.projectPath);

    emitter.on('packages-installed', (code) => {

        if (code !== 0) {
            return console.error(messages.went_wrong);
        }
        
        // @ts-ignore
        console.log('\n√'.brightGreen + ' dependencies installed');

        // @ts-ignore
        console.log('√ '.brightGreen + messages.project_created);
    });
}

/**
 * Returns the template the user whants to use
 * @param templateDirPath The path to the directory where the templates lay
 * @param argv the arguements you got from yargs
 * @returns Promise<string> of the name form the template
 */
async function getTemplate(
    templateDirPath: string,
    argv: Record<string, unknown>
): Promise<string> {
    // get the template from command line agruments
    let template = argv.template;

    // read all templates and put them into an array
    const templateChoises = fs.readdirSync(templateDirPath);

    // check if the user has specified a template in the arguments
    if (template === undefined) {
        // get the template to use from the user
        template = await getTemplateFromUser(templateChoises);
    }

    // check if the template does not exist
    if (templateChoises.indexOf(String(template)) === -1) {
        console.log(messages.templating.not_found, template);
        // get the template to use from the user
        template = await getTemplateFromUser(templateChoises);
    }

    return String(template);
}

async function getTemplateFromUser(templateChoises: string[]): Promise<string> {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'templateType',
            message: messages.questions.startHandler.template,
            choices: templateChoises,
        },
    ]);

    return answers.templateType;
}

/**
 * Creates the folder where the project that the user whants to create residse in
 *
 * Throws an error if the folder could not be created
 *
 * @param options Options from the User regarding the project
 * @returns true if folder was created. False if it already exists
 */
function createProjectFolder(options: StarterTemplateOptions): boolean {
    if (fs.existsSync(options.projectPath)) {
        console.error(messages.already_exists, options.projectPath);
        return false;
    }

    fs.mkdirSync(options.projectPath);

    return true;
}

/**
 * Installs the nodejs packages in the folder given
 * @param projectFolder The folder where to install the pacakges
 * @returns string is empty when everything whent fine
 */
function installPackages(projectFolder: string): void {
    const hasPackages = fs.existsSync(path.join(projectFolder, 'package.json'));

    if (hasPackages) {
        shell.cd(projectFolder);

        // @ts-ignore
        let spinner = new spin.Spinner('%s'.brightMagenta + ' installing dependencies');
        const child = spawn('npm install', {
            shell: true,
        });

        spinner.setSpinnerString('|/-\\');

        spinner.start();
        
        child.on('exit', (code) => {
            spinner.stop();
            emitter.emit('packages-installed', code);
        });
    } else {
        return console.error(messages.no_package);
    }
}
