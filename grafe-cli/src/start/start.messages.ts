import 'colors';

export = {
    commands: {
        start: {
            templating: {
                description: 'What template should be used'
            },
            testing: {
                description: 'Enable testing for the project'
            }
        }
    },
    questions: {
        startHandler: {
            projectName: 'Whats the name of your project?',
            template: 'What project template would you like to use?'
        }
    },
    templating: {
        not_found: 'Template "%s" not found!'
    },
    not_grafe: 'The grafe command must be used within a grafe project.',
    install_packages: 'Installing packages ...',
    project_created: 'Project created!',
    already_exists: 'Folder %s already exists. Delete it or use another name!',
    no_package: 'No package.json',
    went_wrong: 'Something whent wrong',
}