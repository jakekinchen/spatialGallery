import axios from 'axios';
import ignore from 'ignore';
import fs from 'fs-extra';
import path from 'path';
import {
  listFiles,
  uploadFile,
  deleteFile,
  createAssistant,
  retrieveAssistant,
  deleteAssistant,
  createAssistantFile,
  listAssistantFiles,
  listAssistantDetails,
  retrieveFileInfo,
} from './openaiMethods.js';
import {
  assistantDescription,
  assistantInstructions,
  assistantName,
  code_extensions,
  uploadCodebase,
} from './config.js';

// Load .gitignore rules
const ig = ignore().add(fs.readFileSync('.gitignore').toString());

// Allowed extensions for upload
const allowedExtensions = new Set(code_extensions);

const filePath = './Genie/cachedFiles/data.json';

async function commentFilePaths(dirPath = '/../') {
    // Helper function to insert a comment at the top of a file
    const prependComment = (filePath, comment) => {
        const data = fs.readFileSync(filePath, 'utf8');
        const commentedData = `// ${comment}\n${data}`;
        fs.writeFileSync(filePath, commentedData, 'utf8');
    };

    // Recursive function to process each file/directory
    const processDirectory = async (currentPath) => {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            // If entry is a directory, recurse into it
            if (entry.isDirectory()) {
                await processDirectory(fullPath);
            } else {
                const relativePath = path.relative(dirPath, fullPath);
                // Check if the file is ignored or not an allowed extension
                if (ig.ignores(relativePath) || !allowedExtensions.has(path.extname(entry.name))) {
                    continue;
                }
                // Prepend the relative path comment to the file
                prependComment(fullPath, `Path: ${relativePath}`);
            }
        }
    };

    // Start processing from the root directory
    await processDirectory(dirPath);
}

async function updateAssistantJSON(assistantId) {
  // If it doesn't exist, create a new assistant object with the given ID in ./data.json
  if (!fs.existsSync(filePath)) {
    // Create a new data.json file
    fs.writeFileSync(filePath, JSON.stringify({ assistants: {} }));
  }
  // Read the data.json file
  const data = JSON.parse(fs.readFileSync(filePath));
  // If the assistant ID is not present in the data.json file, add it
  if (!data.assistants[assistantId]) {
    data.assistants[assistantId] = {};
  }
  // Update the assistant details in data.json
  const assistantDetails = await listAssistantDetails(assistantId);
  data.assistants[assistantId].details = assistantDetails;
  // Update the assistant files in data.json
  const assistantFiles = await listAssistantFiles(assistantId);
  data.assistants[assistantId].files = assistantFiles;
  // Write the updated data.json file
  fs.writeFileSync(filePath, JSON.stringify(data));
}


// Main function to create an assistant and upload a file
async function createAndUploadAssistant() {
  const codebasePath = './Genie/cachedFiles/codebase.json';
  const data = await readJSON();
  if (uploadCodebase) {
    // Upload the codebase file if it is not already uploaded in the JSON storage
    const storage = await readJSON();
    if (!storage || !storage.files || !storage.files.find(f => f.name === 'codebase.json')) {


    const response = await uploadFile(codebasePath);
    
    if (!response || !response.id) {
      console.error('Failed to upload codebase file.');
      return;
    }
    const codebaseFileId = response.id;
    console.log('Codebase file ID:', codebaseFileId);
  }
  }
  try {
      // Create the assistant
      const assistant = await createAssistant(
          'gpt-4-1106-preview', // model
          assistantName, // name
          assistantDescription, // description
          assistantInstructions, // instructions
          [{ "type": "retrieval" }], // tools
          [], // file_ids will be updated after file upload
          {} // metadata
      );

      const assistantId = assistant.id;
       // Read the files in the data.json file and use their IDs to create assistant files attached to the assistant
      await createAssistantFiles(assistantId);
      // list assistant files
      const assistantFiles = await listAssistantFiles(assistantId);
      console.log('Assistant files:', assistantFiles);
        return assistantId;

  } catch (error) {
      console.error('Error in creating or uploading assistant:', error);
      // If there is an error, delete the assistant
      //await deleteAssistant(assistantId);
  }
}

// Helper function to read files and directories recursively
async function readFiles(dir, uploadList = [], allFilesList = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (ig.ignores(filePath)) {
      continue; // Skip ignored files
    }
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      allFilesList.push({ path: filePath, type: 'directory' });  // Add directory to all files list
      await readFiles(filePath, uploadList, allFilesList); // Recursively read files
    } else {
      allFilesList.push({ path: filePath, type: 'file' });  // Add file to all files list
      if (allowedExtensions.has(path.extname(file))) {
        uploadList.push(filePath); // Only add file with allowed extensions for upload
      }
    }
  }
  return { uploadList, allFilesList };
}

async function uploadFileIntoAssistant(filePath, assistantId) {
  try {
    const fileResponse = await uploadFile(filePath);
    if (!fileResponse || !fileResponse.id) {
      console.error(`Failed to upload file: ${filePath}`);
      return null;
    }

    console.log('File uploaded with ID:', fileResponse.id);

    // Attach the file to the assistant
    const assistantFile = await createAssistantFile(assistantId, fileResponse.id);
    console.log('Assistant file created with ID:', assistantFile.id);

    return fileResponse.id;
  } catch (error) {
    console.error(`Error in uploading file into assistant: ${error}`);
    return null;
  }
}

async function readJSON() {
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
  }
  return null;
}

async function createAssistantFiles(assistantID){
  // Read the files in the data.json file and use their IDs to create assistant files attached to the assistant
  const data = await readJSON();
  if (!data) {
    console.error(`No files found in data.json.`);
    return;
  }
  const files = data.files;
  // Get a list of files already attached to the assistant
  const assistantFiles = await listAssistantFiles(assistantID);
  const assistantFileIds = assistantFiles.map(f => f.fileId);
  for (const file of files) {
    // Check if the file exists before trying to create an assistant file
    if (assistantFileIds.includes(file.fileId)) {
      console.log(`File with ID ${file.fileId} already exists in assistant.`);
      continue;
    }
    const fileInfo = await retrieveFileInfo(file.fileId);
    if (fileInfo) {
      const response = await createAssistantFile(assistantID, file.fileId);
      console.log(`Created the assistant file with ID ${response.id}`);
    }
    else{
      console.log(`File with ID ${file.fileId} does not exist.`);
    }
  }
  return;
}

// Function to delete all files for an assistant
async function deleteAllAssistantFiles(assistantId) {
  try {
    const assistant = await retrieveAssistant(assistantId);
    if (!assistant) {
      console.error(`Assistant with ID ${assistantId} does not exist.`);
      return;
    }

    const files = assistant.files;
    if (!files) {
      console.error(`No files found for assistant with ID ${assistantId}.`);
      return;
    }
    for (const file of files) {
      // Check if the file exists before trying to delete it
      const fileInfo = await retrieveFileInfo(file.fileId);
      if (fileInfo) {
        await deleteFile(file.fileId);
      }
    }
  } catch (error) {
    console.error("Error deleting all assistant files:", error);
  }
}

async function deleteAllFiles() {
  try {
    const files = await listFiles();
    console.log('Files listed:', files);
    for (const file of files) {
      console.log(await deleteFile(file.id));
    }
  } catch (error) {
    console.error('Error in deleting files:', error);
  }
}

// Start the process
async function main() {
  try {
    //console.log(await listFiles());
   //await deleteAllFiles();

    
  } catch (error) {
    console.error('Error:', error);
    
  }
}

export {
  createAndUploadAssistant,
  uploadFileIntoAssistant,
  updateAssistantJSON,
  commentFilePaths,
  readFiles,
  createAssistant,
  deleteAllFiles,
  deleteAllAssistantFiles,
  createAssistantFiles,
}