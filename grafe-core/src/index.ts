import { readAllFilesStats } from './file';
import { initCore } from './initCore';

export = {
  initCore,
};

console.log(readAllFilesStats(__dirname));
