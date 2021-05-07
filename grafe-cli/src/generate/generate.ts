import inquierer from 'inquirer';

function generate() {
    inquierer.prompt([
        {
            type: 'expand',
            name: 'type',
            message: 'What do you want to do?',
            choices: [
                {
                    key: 'p',
                    name: 'Pepperoni and cheese',
                    value: 'PepperoniCheese',
                },
                {
                    key: 'a',
                    name: 'All dressed',
                    value: 'alldressed',
                },
                {
                    key: 'w',
                    name: 'Hawaiian',
                    value: 'hawaiian',
                },
            ],
        },
    ]);
}

export = generate;