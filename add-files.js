const fs = require('fs');
const path = require('path');

const LIBS_DIR = path.join(__dirname, 'packages', 'libs');
const DUMMY_FILE_COUNT = 10;

// Template for the dummy file content
const dummyFileContent = (i) => `export function dummyFunction${i}() {
    console.log('This is dummy function ${i}');
}`;

function createDummyFilesInProject(projectDir) {
    for (let i = 1; i <= DUMMY_FILE_COUNT; i++) {
        const fileName = `dummy-file-${i}.ts`;
        const filePath = path.join(projectDir, fileName);
        fs.writeFileSync(filePath, dummyFileContent(i));
        console.log(`Created ${filePath}`);
    }
}

function processLibsDirectory(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            const fullPath = path.join(dir, file);
            fs.stat(fullPath, (err, stat) => {
                if (err) {
                    console.error('Error stating file:', err);
                    return;
                }

                if (stat.isDirectory()) {
                    // Check if this directory contains a 'package.json' file to identify it as a project
                    const packageJsonPath = path.join(fullPath, 'package.json');
                    if (fs.existsSync(packageJsonPath)) {
                        console.log(`Processing project: ${fullPath}`);
                        createDummyFilesInProject(fullPath);
                    } else {
                        // Recursively process nested directories
                        processLibsDirectory(fullPath);
                    }
                }
            });
        });
    });
}

// Start processing from the LIBS_DIR
processLibsDirectory(LIBS_DIR);