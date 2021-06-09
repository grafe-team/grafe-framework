import 'colors';

export = {
    commands: {
        fix: {
            description: 'Automatically fix occurring issues',
        },
    },
    projectType_warn:
        'WARNING'.yellow + ' PROJECT_TYPE has none of these values ["express"]',
    length_0_warn: 'WARNING'.yellow + ' %s is empty. Please fix manually',
    warn:
        'WARNING'.yellow +
        ' your grafe.json is not 100% right. Please fix manually',
    everything_right:
        'SUCCESS'.green +
        ' your grafe.json is on the latest stand and has no issues',
    update_grafe: 'UPDATE'.cyan + ' grafe.json fixing ' + '%s'.red + ' issues',
    type_error: 'ERROR'.red + ' %s is not existing or has the wrong type',
    array_error: 'ERROR'.red + ' found wrong object in %s-Array',
    not_grafe: 'The grafe command must be used within a grafe project.',
    issue_info: 'INFO'.green + ' found ' + '%s'.red + ' issues',
    confirm: 'Do you want to fix it automatticly',
};
