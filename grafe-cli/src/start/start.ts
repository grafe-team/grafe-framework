import yargs from 'yargs';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
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
export function startCommand(yargs: yargs.Argv<{}>) {
    return yargs;
}

/**
 * Hanles the start command. Gets the projectName from the user and lets him select what project he wants to use.
 * 
 * @param argv Arguments from Yargs 
 * @returns Promise<undefined>
 */
export async function startHandler(argv: any): Promise<undefined> {

    const templateStartersPath = path.join(__dirname, '..', '..', 'templates', 'starters'); 

    const templateChoises = fs.readdirSync(templateStartersPath);

    const answers = await inquirer.prompt([
        {
            type: 'input',
            message: 'Whats the name of your project?',
            name: 'projectName'
        },
        {
            type: 'list',
            name: 'templateType',
            message: 'What project template would you like to use?',
            choices: templateChoises
        }
    ]);

    const projectOptions: StarterTemplateOptions = {
        projectName: answers.projectName,
        projectPath: path.join(process.cwd(), answers.projectName),
        templateName: answers.templateType,
        templatePath: path.join(templateStartersPath, answers.templateType)
    };
    console.log(projectOptions);

    if (!createProjectFolder(projectOptions)) {
        return;
    }

    createDirectoryContents(projectOptions.templatePath, projectOptions.projectName, projectOptions);

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
