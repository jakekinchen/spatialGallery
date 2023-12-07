import fs, { read } from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import ignore from 'ignore';
import { docsBoxPath, docs_extensions, code_extensions, uploadCodebase } from './config.js';
import { uploadFile, createAssistantFile, getActiveAssistant } from './openaiMethods.js';
import process from 'process';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedExtensions = new Set([...code_extensions, ...docs_extensions]);

const storagePath = './Genie/cachedFiles/data.json'

// Load .gitignore rules
const ig = ignore().add(fs.readFileSync('.gitignore', 'utf8'));

// Check if the file should be ignored based on .gitignore and other criteria
const shouldIgnoreFile = (file, mode='docs') => {
  const relativePath = path.relative(process.cwd(), file);

  const ignoreDueToPath = !relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath);
  const ignoreDueToDirectory = relativePath.startsWith('.git') || (mode === 'code' && relativePath.startsWith('Genie'));
  const ignoreDueToGitignore = ig.ignores(relativePath);

  if (ignoreDueToPath || ignoreDueToDirectory || ignoreDueToGitignore) {
    console.log(`Ignoring file '${file}' - Path: ${ignoreDueToPath}, Directory: ${ignoreDueToDirectory}, Gitignore: ${ignoreDueToGitignore}`);
    return true;
  }
  
  return false;
};

// Function to read the contents of a file if it has an allowed extension
const readFileContents = async (filePath, allowedExtensions) => {
  const ext = path.extname(filePath);
    const buffer = fs.readFileSync(filePath);
    const encoding = jschardet.detect(buffer).encoding;
    return iconv.decode(buffer, encoding).replace(/\r?\n|\r/g, '');

};

// Walk through the directory tree recursively
const walkAsync = async (dir, filelist = [], mode = 'docs') => {
  const files = await fsp.readdir(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    if (!shouldIgnoreFile(dirFile) || mode === 'docs') {
      const stat = await fsp.stat(dirFile);
      if (stat.isDirectory()) {
        const nestedFiles = await walkAsync(dirFile, filelist, mode); // Recursively process directories
        filelist.push(...nestedFiles); // Add files from nested directories
      } else {
        const fileContent = await readFileContents(dirFile, allowedExtensions);
        if (fileContent !== null) { // Only add if content is not null
          filelist.push({
            path: dirFile,
            type: 'file',
          });
        }
        else{
          console.log(`Content is null for file: ${dirFile}`);
        }
      }
    } else {
      console.log(`Ignoring file: ${dirFile}`);
    }
  }
  return filelist;
};


async function readJSON(filePath) {
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
  }
  return null;
}

async function writeJSON(data, filePath) {
  const formattedJSON = JSON.stringify(data, null, 2); // Indent with 2 spaces for readability
  fs.writeFileSync(filePath, formattedJSON, 'utf8');
  return formattedJSON.length;
}

// Update JSON storage with file and directory details from docsBox
const updateJSONStorage = async (fileTree) => {
  let storage = await readJSON(storagePath);
  if (!storage) {
    storage = { assistants: [], files: [] };
  }
  const assistantID = await getActiveAssistant();
  for (const file of fileTree) {
    if (file.type === 'file' && file.content !== null) {
      const relativeFilePath = path.relative(docsBoxPath, file.path);
      
      // Check if file is already in storage
      const fileInStorage = storage.files.find(f => f.path === relativeFilePath);
      if (!fileInStorage) {
        const uploadResponse = await uploadFile(file.path);
        if (assistantID != null) {
          const assistantResponse = await createAssistantFile(assistantID, uploadResponse.id);
          console.log(`Assistant file created: ${assistantResponse}`);
        }
      }
    }
  }
};

// Main function to update JSON storage with docsBox contents
const updateStorageWithDocsBox = async () => {
  const fileTree = await walkAsync(docsBoxPath, [], 'docs');
  await updateJSONStorage(fileTree);
};

const createJSONDocument = async (directoryPath, mode) => {
  // Set allowed extensions based on mode
  //console.log("Directory path: ", directoryPath)
  const allowedExtensions = new Set(
    mode === 'docs' ? [...code_extensions, ...docs_extensions] : code_extensions
  );

  const rootDirectory = mode === 'docs' ? docsBoxPath : path.join(__dirname, '..');
  const allFiles = await walkAsync(path.join(rootDirectory, directoryPath), mode);
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
    await writeJSON(jsonData, jsonFilePath); // Write JSON data to the file
    const newSize = fs.statSync(jsonFilePath).size; // Get the new size of the file
    shouldUpload = oldSize !== newSize; // Compare old and new sizes
  } else {
    await writeJSON(jsonData, jsonFilePath); // Create new JSON file if it doesn't exist
  }

  return { shouldUpload, jsonFilePath };
}

export {
  createJSONDocument,
  updateStorageWithDocsBox,
};