import * as inquirer from 'inquirer';
import messages from './generate.messages';

/**
 * Generates the CLI for creating a new util component
 *
 * @param argv Arguments of the CLI
 * @returns Promise<undefined>
 */
export async function generateUtilsHandler(
  argv: Record<string, unknown>
): Promise<void> {
  const questions = [];

  if (argv.type == undefined) {
    questions.push({
      type: 'list',
      name: 'component',
      message: messages.questions.utilsHandler.type,
      choices: ['Database-Component'],
    });
  }

  let answers = [];
  // Check if there is at least one question
  if (questions.length > 0) {
    // prompt the user the questions
    answers = await inquirer.prompt(questions);
  }

  answers.component = answers.component || argv.type;

  // generateStatic(answers.name);
}
