// Function to clean up files in the exports folder
export function cleanupFolder(folderName) {
    const dirPath = path.join(__dirname, folderName);
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error(`Error reading ${folderName} directory:`, err);
        return;
      }
  
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        fs.unlink(filePath, err => {
          if (err) {
            console.error('Error deleting:', err);
          } else {
            console.log(`Deleted ${folderName}: ${filePath}`);
          }
        });
      });
    });
  }