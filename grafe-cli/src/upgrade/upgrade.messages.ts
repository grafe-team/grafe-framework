import 'colors';

export = {
    projectType_warn:
        'WARNING'.yellow + ' PROJECT_TYPE has none of these values ["express"]',
    warn:
        'WARNING'.yellow +
        ' your grafe.json is not 100% right. Please fix manually',
    everything_right:
        'SUCCESS'.green +
        ' your grafe.json is on the latest stand and has no issues',
    update_grafe: 'UPDATE'.cyan + ' grafe.json fixing ' + '%s'.red + ' issues',
    type_error:
        'ERROR'.red +
        ' %s is not existing or has the wrong type please fix manually',
    not_grafe: 'The grafe command must be used within a grafe project.',
};
