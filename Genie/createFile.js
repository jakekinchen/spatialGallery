const fs = require('fs');
const path = require('path');
const ignore = require('ignore');

const {
  uploadCodebase,
  code_extensions,
  docs_extensions,
  docsBoxPath,
} = require('./config');

const allowedExtensions = new Set([...code_extensions, ...docs_extensions]);

// Load .gitignore rules
const ig = ignore().add(fs.readFileSync('.gitignore', 'utf8'));

// Check if the file should be ignored based on .gitignore and other criteria
const shouldIgnoreFile = (file) => {
  const relativePath = path.relative(process.cwd(), file);
  // Ignore files inside .git directory or the Genie directory
  if (relativePath.startsWith('.git') || relativePath.startsWith('Genie')) {
    return true;
  }
  // Use ignore to check against .gitignore rules
  return ig.ignores(relativePath);
};

// Function to read the contents of a file if it has an allowed extension
const readFileContents = (filePath, allowedExtensions) => {
  const ext = path.extname(filePath);
  if (allowedExtensions.has(ext)) {
    return fs.readFileSync(filePath, 'utf8').replace(/\r?\n|\r/g, '');
  }
  return null; // Content is not included for disallowed file types
};


// Walk through the directory tree recursively
const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const dirFile = path.join(dir, file);
    if (!shouldIgnoreFile(dirFile)) {
      const stat = fs.statSync(dirFile);
      if (stat.isDirectory()) {
        filelist.push({ path: dirFile, type: 'directory', contents: [] });
        walkSync(dirFile, filelist[filelist.length - 1].contents);
      } else {
        filelist.push({ path: dirFile, type: 'file', content: readFileContents(dirFile) });
      }
    }
  });
  return filelist;
};

// Update JSON storage with file and directory details from docsBox
const updateJSONStorage = (fileTree) => {
  const storagePath = './data.json';
  let storage = { assistants: [], files: [] };
  if (fs.existsSync(storagePath)) {
    storage = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
  }

  const processFiles = (files) => {
    files.forEach(file => {
      if (file.type === 'directory') {
        processFiles(file.contents);
      } else if (file.content !== null) {
        const fileDetails = {
          fileId: null, // Update when the file is uploaded
          name: path.basename(file.path),
          type: path.extname(file.path).substring(1),
          size: fs.statSync(file.path).size,
          content: file.content
        };
        storage.files.push(fileDetails);
      }
    });
  };

  processFiles(fileTree);
  fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
};


// Main function to update JSON storage with docsBox contents
const updateStorageWithDocsBox = () => {
  const fileTree = walkSync(docsBoxPath);
  updateJSONStorage(fileTree);
};

// Write JSONL to a file
const writeJSON = (data, filePath) => {
  // Convert the entire data array into a JSON string
  const jsonString = JSON.stringify(data); // The '2' argument here adds indentation for readability
  fs.writeFileSync(filePath, jsonString);
};

const createJSONDocument = (directoryPath, mode) => {
  // Set allowed extensions based on mode
  const allowedExtensions = new Set(
    mode === 'docs' ? [...code_extensions, ...docs_extensions] : code_extensions
  );

  const rootDirectory = mode === 'docs' ? docsBoxPath : path.join(__dirname, '..');
  const allFiles = walkSync(path.join(rootDirectory, directoryPath));

  // Create JSON entry only for files with allowed extensions
  const jsonData = allFiles.map(file => {
    if (file.type === 'file' && allowedExtensions.has(path.extname(file.path))) {
      return {
        file_path: path.relative(rootDirectory, file.path),
        content: readFileContents(file.path, allowedExtensions),
      };
    }
    return null;
  }).filter(entry => entry !== null);

  // Define cachedFiles directory within the Genie folder
  const cachedFilesPath = path.join(__dirname, 'Genie', 'cachedFiles');

  // Ensure that the cachedFiles directory exists
  if (!fs.existsSync(cachedFilesPath)) {
    fs.mkdirSync(cachedFilesPath, { recursive: true });
  }

  // Set the path for the JSON file within the cachedFiles directory
  const jsonFileName = mode === 'docs' ? path.basename(directoryPath) + '.json' : 'codebase.json';
  const jsonFilePath = path.join(cachedFilesPath, jsonFileName);

  let shouldUpload = true;
  if (fs.existsSync(jsonFilePath)) {
    const oldSize = fs.statSync(jsonFilePath).size;
    const newSize = writeJSON(jsonData, jsonFilePath);
    shouldUpload = oldSize !== newSize; // Compare sizes
  } else {
    writeJSON(jsonData, jsonFilePath); // Create new JSON file if it doesn't exist
  }

  return { shouldUpload, jsonFilePath };
};

module.exports = {
  createJSONDocument,
  updateStorageWithDocsBox,
};