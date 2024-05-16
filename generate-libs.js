const { exec } = require('child_process');

// Function to execute the NX command with specific template
function createLibrary(index) {
  return new Promise((resolve, reject) => {
    const name = `lib-${index}`;
    const directory = `packages/libs-5/lib${index}`;
    const command = `npx nx g @nx/js:lib --name ${name} --directory ${directory} --no-interactive --projectNameAndRootFormat=as-provided`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        reject(stderr);
      }
      console.log(`Stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Generate and create 100 libraries
async function generateLibraries() {
  for (let i = 401; i <= 600; i++) {
    console.log(`Creating library lib-${i} in directory lib${i}...`);
    try {
      await createLibrary(i);
      console.log(`Library lib-${i} created successfully.`);
    } catch (error) {
      console.error(`Failed to create lib-${i}: ${error}`);
    }
  }
}

generateLibraries();