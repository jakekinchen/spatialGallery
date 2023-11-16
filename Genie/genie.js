#!/usr/bin/env node
// Import required modules
import fs from 'fs';
import fsPromises from 'fs/promises';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';
import { createAndUploadAssistant, uploadFileIntoAssistant } from './createAssistant.js';
import { createJSONDocument } from './createFile.js';
import { listFiles, listAssistantFiles, listAssistantDetails, uploadFile, deleteFile, deleteAssistantFile, retrieveFileInfo, retrieveFileContent, getActiveAssistant, deleteAllAssistants, listAssistants} from './openaiMethods.js';
import { uploadCodebase } from './config.js';
import process from 'process';

// Configure dotenv to load environment variables from .env file
dotenv.config({path: 'Genie/.env'});

const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Create readline interface for CLI interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
  }


// Function to create a thread
async function createThread() {
  return await openai.beta.threads.create();
}

// Function to send a message to the thread
async function sendMessageToThread(threadId, content) {
    //cast content to string
    content = content.toString();
  return await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content
  });
}

async function isRunCompleted(threadId, runId) {
    try {
      const run = await openai.beta.threads.runs.retrieve(threadId, runId);
      return run.status === 'completed' || run.status === 'failed';
    } catch (error) {
      console.error("Error checking run completion:", error);
      return false;
    }
  }

async function processMessage(threadId, assistantId) {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    return run.id; // This run ID can be used to check the status of the processing
  }

  async function retrieveResponses(threadId) {
    let messages;
    let assistantMessages = [];
    let attempts = 0;
    const maxAttempts = 10; // Set a maximum number of attempts to avoid infinite loops
  
    do {
      messages = await openai.beta.threads.messages.list(threadId);
      assistantMessages = messages.data.filter(message => message.role === "assistant");
      if (assistantMessages.length > 0) break; // If we have assistant messages, break the loop
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a bit before trying again
      attempts++;
    } while (attempts < maxAttempts);
  
    assistantMessages.forEach(message => {
      if (message.content.length > 0 && message.content[0].type === "text") {
        console.log("Assistant:", message.content[0].text.value);
      }
    });
  }

// Function to run the assistant
async function runAssistant(threadId, assistantId) {
    if (!assistantId) {
        throw new Error('Invalid assistant ID provided to runAssistant function.');
      }
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId
  });
    return run.id;
}

// Function to retrieve and display the assistant's response
async function displayResponse(threadId, lastMessageTimestamp = 0) {
  const messages = await openai.beta.threads.messages.list(threadId);
  let latestTimestamp = lastMessageTimestamp;

  // Sort messages based on timestamp (converted to milliseconds)
  const sortedMessages = messages.data.sort((a, b) => (a.created_at * 1000) - (b.created_at * 1000));

  sortedMessages.forEach(message => {
      // Convert message.created_at to milliseconds for comparison
      const messageTimestamp = message.created_at * 1000;
      if (messageTimestamp > lastMessageTimestamp) {
          if (message.content && Array.isArray(message.content)) {
              message.content.forEach(contentPart => {
                  if (contentPart.type === 'text' && contentPart.text && contentPart.text.value) {
                      console.log(`${message.role}: ${contentPart.text.value}`);
                  }
              });
          } else if (typeof message.content === 'string') {
              console.log(`${message.role}: ${message.content}`);
          } else {
              console.log(`${message.role}: ${JSON.stringify(message.content, null, 2)}`);
          }
          latestTimestamp = Math.max(latestTimestamp, messageTimestamp);
      }
  });

  return latestTimestamp;
}

async function handleConversation(assistantId, prompt) {
      const thread = await createThread();
      const threadId = thread.id;
      let lastMessageTimestamp = 0;

    
        // If a prompt is provided, send it as the initial message
        if (prompt) {
            await sendMessageToThread(threadId, prompt);
            let runId = await runAssistant(threadId, assistantId);
            console.log('Waiting for assistant response...');
            while (!(await isRunCompleted(threadId, runId))) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            await displayResponse(threadId);
        } else {
            // If no prompt is provided, start with the welcome message run
            let runId = await runAssistant(threadId, assistantId);
    
            // Wait for the welcome message run to complete
            while (!(await isRunCompleted(threadId, runId))) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
    
            // Retrieve and display the assistant's welcome message
            await displayResponse(threadId);
        }
  
        var isTrue = true;
        while (isTrue) {
            const userMessage = await askQuestion('You: ');
    
            if (userMessage.toLowerCase() === 'exit') {
                console.log('Exiting conversation.');
                break;
            }
    
            await sendMessageToThread(threadId, userMessage);
            const runId = await runAssistant(threadId, assistantId);
    
            console.log('Waiting for assistant response...');
            while (!(await isRunCompleted(threadId, runId))) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
    
            lastMessageTimestamp = await displayResponse(threadId, lastMessageTimestamp);
        }
    
        rl.close();
    }

  async function logError(error) {
    const errorLogPath = './Genie/errors.json';
    let errorLog = [];
  
    // Read existing errors if the file exists
    try {
      if (fs.existsSync(errorLogPath)) {
        const data = await fsPromises.readFile(errorLogPath, 'utf8');
        errorLog = JSON.parse(data);
      }
  
      // Append the new error
      errorLog.push({
        timestamp: new Date().toISOString(),
        error: error.toString(),
      });
  
      // Write the updated errors back to the file
      await fsPromises.writeFile(errorLogPath, JSON.stringify(errorLog, null, 2), 'utf8');
    } catch (err) {
      // Handle possible read/write errors here
      console.error('Error logging failed:', err);
    }
  }

  async function start() {
    let uploadList = [];
    // if ./Genie/code.json does not exist or is empty, create it with createJSONDocument()
    if (uploadCodebase) {
        const { shouldUpload, jsonFilePath } = createJSONDocument('..', 'codebase');
        if (shouldUpload) {
          uploadList.push(jsonFilePath);
        }
    }
  

    if (process.argv.includes('start')) {
        const assistants = await listAssistants();
        let assistantId = null;
    
        // If no assistants are found, create a new one
        if (assistants == "undefined" || assistants == null || assistants == "" || assistants == []) {
          console.log("No assistant found, creating and uploading a new one.");
          assistantId = await createAndUploadAssistant(); // Create and upload if no assistant exists
        } else {
          // Otherwise, use the first assistant in the list
          console.log("Assistant found, using existing one.");
          //console.log("assistants: "+assistants);
          assistantId = assistants[0].id;
        }
    
        // Ensure we have an assistant ID before proceeding
        if (assistantId) {
          console.log(`Starting conversation with assistant ID: ${assistantId}`);
          await handleConversation(assistantId, "Greet the user and remember, when the user asks for information about a file, always check in the code.json file to search for the file name first (that is where we keep our codebase files) Now greet the user and help them with their code please."); // Start the conversation with the selected assistant
        } else {
          console.error("Failed to create or find an assistant.");
          return; // Exit the function if no assistant could be created or found
        }
      } else if (process.argv.includes('create')) {
      await deleteAllAssistants(); // Delete any old assistants
      await createAndUploadAssistant(); // Create and upload a new assistant
      // Additional code for 'update', 'link', 'unlink', 'delete' goes here
    } else if (process.argv.includes('update')) {
      const assistantId = await getActiveAssistant();
      // Get files associated with assistant
      const oldFiles = await listAssistantFiles(assistantId);
      // Delete old files
      for (const file of oldFiles) {
        await deleteAssistantFile(assistantId, file.id);
      }
      // Create new file
      createJSONDocument();
      // Upload new file
      await uploadFileIntoAssistant('./Genie/code.json', assistantId);
      
    } else if (process.argv.includes('link')){
        if (process.argv.includes('code')){
            const path = './Genie/code.json';
            const assistantId = await getActiveAssistant();
            const response = await uploadFileIntoAssistant(path, assistantId);
            console.log("Code linked to assistant");
        } else if (process.argv.includes('error')){
            const path = './Genie/error.json';
            const assistantId = await getActiveAssistant();
            const response = await uploadFileIntoAssistant(path, assistantId);
            console.log("Error handling linked to assistant");
        }
      // Code to link error handling to the assistant goes here
    } else if (process.argv.includes('unlink')){
      // Code to unlink error handling from the assistant goes here
    } else if (process.argv.includes('delete')){
      // Delete all assistants
      await deleteAllAssistants();
    } else if (process.argv.includes('list')){
        // List all assistants
        const response = await listAssistants();
        console.log(response);
        }
        else if (process.argv.includes('help')){
            console.log('Usage: genie [start|create|update|delete|link|unlink|list|help]');
        }
    else {
      console.log('Usage: genie [start|create|update|delete|link|unlink|list|help]');
    }
    process.exit();
  }
  
  // Main function to start the application based on the command line arguments
  async function main() {
    await start(); // Call the start function which handles everything based on command-line arguments
   
  }
  
  main();