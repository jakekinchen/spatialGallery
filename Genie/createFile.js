import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import { docsBoxPath, docs_extensions, code_extensions, uploadCodebase } from './config.js';
import process from 'process';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedExtensions = new Set([...code_extensions, ...docs_extensions]);

// Load .gitignore rules
const ig = ignore().add(fs.readFileSync('.gitignore', 'utf8'));

// Check if the file should be ignored based on .gitignore and other criteria
const shouldIgnoreFile = (file) => {
  // Make sure the path is relative to the current working directory
  const relativePath = path.relative(process.cwd(), file);

  // Check if the relative path is valid
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return true; // Ignore files outside the current working directory
  }

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
        const nestedFiles = walkSync(dirFile); // Recursively get files from the directory
        nestedFiles.forEach(nestedFile => filelist.push(nestedFile)); // Add them to the main file list
      } else {
        filelist.push({ path: dirFile, type: 'file', content: readFileContents(dirFile, allowedExtensions) });
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

// Write JSON to a file
const writeJSON = (data, filePath) => {
  const formattedJSON = JSON.stringify(data, null, 2); // Indent with 2 spaces for readability
  fs.writeFileSync(filePath, formattedJSON, 'utf8');
};

const createJSONDocument = (directoryPath, mode) => {
  // Set allowed extensions based on mode
  //console.log("Directory path: ", directoryPath)
  const allowedExtensions = new Set(
    mode === 'docs' ? [...code_extensions, ...docs_extensions] : code_extensions
  );

  const rootDirectory = mode === 'docs' ? docsBoxPath : path.join(__dirname, '..');
  const allFiles = walkSync(path.join(rootDirectory, directoryPath));
  //console.log("Path: ", path.join(rootDirectory, directoryPath))
  // Create JSON entry only for files with allowed extensions
  const jsonData = allFiles.map(file => {
    if (file.type === 'file' && allowedExtensions.has(path.extname(file.path))) {
      return {
        name: path.basename(file.path),
        file_path: path.relative(rootDirectory, file.path),
        content: readFileContents(file.path, allowedExtensions),
      };
    }
    return null;
  }).filter(entry => entry !== null);

  // Define cachedFiles directory within the Genie folder
  const cachedFilesPath = path.join(__dirname, 'cachedFiles');

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

export {
  createJSONDocument,
  updateStorageWithDocsBox,
};