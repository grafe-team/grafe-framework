import yargs from 'yargs';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs'
import { createDirectoryContents } from '../utils/templating'

export interface StarterTemplateOptions {
    templatePath: string; // Path to the template
    templateName: string; // Name of the template
    projectPath: string;  // Path to the project of the user
    projectName: string;  // Name of the project from the user
}

/**
 * Describes the syntax of the start command 
 * 
 * @param yargs Yargs object to add information to 
 * @returns The same Yargs object
 */
export function startCommand(yargs: yargs.Argv<{}>): yargs.Argv<{}> {
    return yargs;
}

/**
 * Hanles the start command. Gets the projectName from the user and lets him select what project he wants to use.
 * 
 * @param argv Arguments from Yargs 
 * @returns Promise<undefined>
 */
export async function startHandler(argv: any): Promise<void> {
    // get project name from the arguments
    let projectName: string = argv.projectName;

    // if the project name was not provided get it from the user
    if (projectName.length === 0) {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                message: 'Whats the name of your project?',
                name: 'projectName'
            }
        ]);

        projectName = answers.projectName;
    }

    // create the path to the template starter dir
    const templateStartersPath = path.join(__dirname, '..', '..', 'templates', 'starters'); 

    // read all templates and put them into an array
    const templateChoises = fs.readdirSync(templateStartersPath);

    // get the template to use from the user
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'templateType',
            message: 'What project template would you like to use?',
            choices: templateChoises
        }
    ]);

    const projectOptions: StarterTemplateOptions = {
        projectName: projectName,
        projectPath: path.join(process.cwd(), projectName),
        templateName: answers.templateType,
        templatePath: path.join(templateStartersPath, answers.templateType)
    };

    // create project folder 
    if (!createProjectFolder(projectOptions)) {
        return;
    }

    // copy template into projet folder
    createDirectoryContents(projectOptions.templatePath, projectOptions.projectName, projectOptions);

    // install packages
    console.log('Installing packages ...');

    // install the node packages
    const packagesInstalled = installPackages(projectOptions.projectPath)

    // check if there was an error when installing the packages
    if (packagesInstalled.length !== 0) {
        console.error(packagesInstalled);
        return;
    }

    console.log("Project created!");
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
        console.error(`Folder ${options.projectPath} already exists. Delete it or use another name!`);
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
function installPackages(projectFolder: string): string {
    const hasPackages = fs.existsSync(path.join(projectFolder, 'package.json'));

    if (hasPackages) {
        shell.cd(projectFolder);
        const result = shell.exec('npm install', {
            silent: true
        });
    
        if (result.code !== 0) {
            return 'Something whent wrong';
        }
        return '';
    }
    return 'No package.json';
}
