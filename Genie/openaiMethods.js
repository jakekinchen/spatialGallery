// ES Module syntax
import {OpenAI, toFile} from 'openai';
import dotenv from 'dotenv';
import process from 'process';
import path from 'path';
import { promises as fsp, write } from 'fs';
import fs from 'fs';
import { convertCsvToJson } from './config.js';

dotenv.config({path: 'Genie/.env'}); // Load the environment variables from a .env file

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Initialize the OpenAI client with your API key

const storagePath = './Genie/cachedFiles/data.json';

// Function to list files
async function listFiles(purpose) {
  try {
    const response = await openai.files.list({ purpose });
    //console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error listing files:", error);
  }
}

function handleError(error, message) {
  console.error(`${message}:`, error);
}



async function readJSON() {
  try {
    const data = fs.readFileSync(storagePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    handleError(error, 'Error reading JSON file');
    return null; // Return null in case of error
  }
}

async function writeJSON(data) {
  try {
    await fsp.writeFile(storagePath, JSON.stringify(data, null, 2));
  } catch (error) {
    handleError(error, 'Error writing JSON file');
  }
}


async function updateFileInJSON(updateData) {
  const data = await readJSON();
  if (!data) return;
  
  const file = data.files.find(file => file.name === updateData.name);
  if (file) {
    Object.assign(file, updateData);
    await writeJSON(data);
  } else {
    // add the updateData to the files array
    data.files.push(updateData);
    await writeJSON(data);
  }
}

async function updateAssistantInJSON(assistantId, updateData) {
  const data = await readJSON();
  if (!data) return;

  const assistantIndex = data.assistants.findIndex(assistant => assistant.assistantId === assistantId);
  if (assistantIndex !== -1) {
    Object.assign(data.assistants[assistantIndex], updateData);
    await writeJSON(data);
  } else {
    console.error('Assistant not found in the JSON data.');
  }
}

async function isFileInJSON(fileName) {
  const data = await readJSON();
  if (!data) return false;

  const file = data.files.find(file => file.name === fileName);
  if (file) {
    return true;
  } else {
    return false;
  }
}

// Function to upload a single file to OpenAI and return the file ID
async function uploadFile(filePath, purpose='assistants') {
  // Check if the file exists before trying to upload it
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist.`);
    return;
  }
  // Check if the file is already uploaded
  const fileName = path.basename(filePath);
  const fileExists = await isFileInJSON(fileName);
  if (fileExists) {
    console.log(`File ${fileName} is already uploaded.`);
    return;
  }
  const supportedFormats = ['c', 'cpp', 'csv', 'docx', 'html', 'java', 'json', 'md', 'pdf', 'php', 'pptx', 'py', 'rb', 'tex', 'txt', 'css', 'jpeg', 'jpg', 'js', 'gif', 'png', 'tar', 'ts', 'xlsx', 'xml', 'zip'];

  const fileExtension = path.extname(filePath).slice(1);
  if (!supportedFormats.includes(fileExtension)) {
    console.error(`File extension ${fileExtension} is not supported. Please use one of the following formats: ${supportedFormats.join(', ')}`);
    return;
  }

  let uploadPath = filePath;
  // If the file is a CSV, convert it to JSON and update the upload path
  if (fileExtension === 'csv') {
    const jsonFilePath = path.join('Genie', 'cachedFiles', `${path.basename(filePath, '.csv')}.json`);
    await convertCsvToJson(filePath, jsonFilePath);
    const uploadPath = jsonFilePath;
    const fileExtension = 'json';
  }

  try {
    const content = await toFile(fs.createReadStream(uploadPath));
    const response = await openai.files.create({
      file: content,
      purpose: purpose,
    });

    const fileStat = await fsp.stat(uploadPath); // file stat of the file that was uploaded
    const fileStatOriginal = await fsp.stat(filePath); // file stat of the original file
    await updateFileInJSON({
      name: path.basename(filePath),
      type: fileExtension,
      path: filePath,
      lastModified: fileStatOriginal.mtimeMs,
      size: fileStatOriginal.size,
      fileId: response.id
    });

    return response;
  } catch (error) {
    handleError(error, 'Error uploading file');
  }
}

// Function to delete a file
// Function to delete a file
async function deleteFile(fileId) {
  try {
    // Check if the file exists before trying to delete it
    const fileInfo = await retrieveFileInfo(fileId);
    if (!fileInfo) {
      console.log(`File with ID ${fileId} does not exist.`);
      return;
    }

    const response = await openai.files.del(fileId);
    console.log("File deleted:", response.data);
    const data = await readJSON();
    const fileIndex = data.files.findIndex(file => file.fileId === fileId);
    if (fileIndex !== -1) {
      data.files.splice(fileIndex, 1);
      await writeJSON(data);
    }
    return response.data;
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

// Function to retrieve file information
async function retrieveFileInfo(fileId) {
  try {
    const response = await openai.files.retrieve(fileId);
    return response;
  } catch (error) {
    console.error("Error retrieving file info:", error);
  }
}

// Function to retrieve file content
async function retrieveFileContent(fileId) {
  try {
    const response = await openai.files.retrieveContent(fileId);
    return response.data;
  } catch (error) {
    console.error("Error retrieving file content:", error);
  }
}

// Function to create an assistant
async function createAssistant(model, name, description, instructions, tools, file_ids, metadata) {
    try {

        // Replace the below line with the actual OpenAI API call to create the assistant
        const response = await openai.beta.assistants.create({
            model,
            name,
            description,
            instructions,
            tools,
            file_ids,
            metadata,
        });
        // Update the JSON storage with the assistant ID
        const newAssistant = {
          assistantId: response.id,
        };
        const data = await readJSON();
        data.assistants.push(newAssistant);
        await writeJSON(data);
        return response; // Return the assistant data
    } catch (error) {
        console.error("Error creating assistant:", error);
        throw error; // Rethrow the error to be caught in the calling function
    }
}


// Function to retrieve an assistant
async function retrieveAssistant(assistantId) {
  try {
    const response = await openai.beta.assistants.retrieve(assistantId);
    return response; // Return the actual assistant data
  } catch (error) {
    console.error("Error retrieving assistant:", error);
    return null; // Return null if there was an error retrieving the assistant
  }
}
  // Function to modify an assistant
  async function modifyAssistant(assistantId, changes) {
    try {
      const response = await openai.beta.assistants.update(assistantId, changes);
      updateAssistantInJSON(assistantId, changes);
      console.log("Assistant updated:", response);
    } catch (error) {
      console.error("Error updating assistant:", error);
    }
  }

  // Function to delete an assistant
  async function deleteAssistant(assistantId) {
    try {
      const response = await openai.beta.assistants.del(assistantId);
      // Update the JSON storage with the assistant ID
      await deleteAssistantJSON(assistantId);
      console.log("Assistant deleted:", response);
    } catch (error) {
      console.error("Error deleting assistant:", error);
    }
  }

  // Function to delete all assistants
  async function deleteAllAssistants() {
    try {
      const assistants = await listAssistants();
      assistants.forEach(async (assistant) => {
        await deleteAssistant(assistant.id);
      });
      return true;
    } catch (error) {
      console.error("Error deleting assistants:", error);
    }
    console.log("All assistants deleted.");
    console.log("Assistants: ", await listAssistants());
  }

  async function updateAssistantJSON(assistantId) {
    // Update the JSON storage with the assistant ID
    // Read the data.json file
    const data = JSON.parse(fs.readFileSync(storagePath));
    // Add a new object in the assistants array with the assistant ID
    data.assistants.push({ assistantId: assistantId });
    // Write the updated data back to the JSON storage
    fs.writeFileSync(storagePath, JSON.stringify(data));
  }
  
  async function deleteAssistantJSON(assistantId) {
    // Remove the assistant object with the given ID from the JSON storage
    // Read the data.json file
    const data = JSON.parse(fs.readFileSync(storagePath));
    // Remove the assistant object with the given ID
    const assistantIndex = data.assistants.findIndex(assistant => assistant.assistantId === assistantId);
    data.assistants.splice(assistantIndex, 1);
    // Write the updated data back to the JSON storage
    fs.writeFileSync(storagePath, JSON.stringify(data));
  }

// Function to create an assistant file by attaching a File to an assistant
async function createAssistantFile(assistantId, fileId) {
  try {
    const response = await openai.beta.assistants.files.create(assistantId, {
      file_id: fileId
    });
    return response; // Return the data for further processing
  } catch (error) {
    console.error("Error creating assistant file:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

  // Function to retrieve an assistant file
  async function retrieveAssistantFile(assistantId, fileId) {
    try {
      const response = await openai.beta.assistants.files.retrieve(assistantId, fileId);
      console.log("Assistant file retrieved:", response.data);
      return response; // Return the data for further processing
    } catch (error) {
      console.error("Error retrieving assistant file:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  // Function to delete an assistant file
  async function deleteAssistantFile(assistantId, fileId) {
    try {
      const response = await openai.beta.assistants.files.del(assistantId, fileId);
      //console.log("Assistant file deleted:", response);
    } catch (error) {
      console.error("Error deleting assistant file:", error);
    }
  }

  // Function to list assistant files
  async function listAssistantFiles(assistantId) {
    try {
      const response = await openai.beta.assistants.files.list(assistantId);
      return response.data;
    } catch (error) {
      console.error("Error listing assistant files:", error);
    }
  }

// Function to get assistant id
async function getActiveAssistant() {
  const response = await readJSON();
  if (!response || !response.assistants || response.assistants.length === 0) {
    return null;
  }
  const assistantId = response.assistants[0].assistantId;
  return assistantId;
}

async function listAssistants() {
  //console.log("Fetching list of assistants...");
  try {
    const response = await openai.beta.assistants.list();
    //console.log("Assistants fetched:", response.data);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.log("No assistants found or response is not an array:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error listing assistants:", error);
    return []; // Return an empty array on error
  }
}


async function listAssistantDetails() {
  try {
    const assistantsResponse = await listAssistants(); // Ensure this is awaited

    if (!assistantsResponse ) {
      console.log('No assistants found.');
      return null;
    }

    // Get the ID of the first assistant from the data array
    const assistantId = assistantsResponse[0].id; 

    const assistantResponse = await retrieveAssistant(assistantId);

    if (!assistantResponse) {
      console.log('No assistant data was returned by the retrieveAssistant function.');
      return null;
    }
    return assistantResponse; // Assuming this is the correct assistant object with an ID
    
  } catch (error) {
    console.error('Error in listing assistant details:', error);
    return null; // Return null in case of error
  }
}

  // Export all functions
  export {
    listFiles,
    uploadFile,
    deleteFile,
    retrieveFileInfo,
    retrieveFileContent,
    createAssistant,
    retrieveAssistant,
    modifyAssistant,
    deleteAssistant,
    createAssistantFile,
    retrieveAssistantFile,
    deleteAssistantFile,
    listAssistantFiles,
    listAssistantDetails,
    listAssistants,
    getActiveAssistant,
    deleteAllAssistants,
  };
