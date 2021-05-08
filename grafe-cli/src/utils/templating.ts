import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';


export interface StarterTemplateOptions {
    templatePath: string;
    templateName: string;
    projectPath: string;
    projectName: string;
}

export function createDirectoryContents(templatePath: string, currentFolder: string, options: any) {
    const SKIP_FILES = ['node_modules', '.template.json', 'build'];

    // read all files/folders (1 level) from template folder
    const filesToCreate = fs.readdirSync(templatePath);
    // loop each file/folder
    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file);
        
        // get stats about the current file
        const stats = fs.statSync(origFilePath);
    
        // skip files that should not be copied
        if (SKIP_FILES.indexOf(file) > -1) return;
        
        if (stats.isFile()) {
            // read file content and transform it using template engine
            let contents = fs.readFileSync(origFilePath, 'utf8');

            // insert dynamic content 
            contents = ejs.render(contents, options);

            // write file to destination folder
            const writePath = path.join(process.cwd(), currentFolder, file);
            fs.writeFileSync(writePath, contents, 'utf8');
        } else if (stats.isDirectory()) {
            // create folder in destination folder
            fs.mkdirSync(path.join(process.cwd(), currentFolder, file));
            // copy files/folder inside current folder recursively
            createDirectoryContents(path.join(templatePath, file), path.join(currentFolder, file), options);
        }
    });
}
