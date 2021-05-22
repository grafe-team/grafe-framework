import { initCore } from './initCore';
import { readAllFilesStats } from './file';

export = {
    initCore
};

console.log(readAllFilesStats(__dirname));
