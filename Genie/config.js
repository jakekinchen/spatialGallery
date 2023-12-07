import csvtojson from 'csvtojson';
import fs from 'fs';

const code_extensions = ['.js', '.css', '.jsx', '.tsx', '.ts', '.html', '.json', '.md' ] // Extensions of code files to include in the codebase json in docsBox
const docs_extensions = ['pdf', 'txt', 'docx', 'doc', 'csv', 'xls', 'xlsx', 'rtf', 'pptx', 'ppt', 'md']  // Extensions of docs files to include in the docs json in docsBox
const assistantDescription = 'Assistant to help with codebase'
const assistantInstructions = 'Help the user with the codebase'
const assistantName = 'GenieGPT'


const docsBoxPath = './Genie/docsBox' // Warning: Using a custom docsBox path is not recommended unless you know what you are doing
const docsBoxFileLimit = 20 // Max number of files to include in docsBox per OpenAI 
const docsBoxFileSizeLimit = 536870912 // Max size of a file to include in docsBox per OpenAI (512MB)

// Declare a boolean named uploadCodebase to determine whether to upload codebase or not
const uploadCodebase = false

const concatenateFilesWithinDirectory = true;

async function convertCsvToJson(csvFilePath, jsonFilePath) {
    const jsonArray = await csvtojson().fromFile(csvFilePath);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));
}

export {
    code_extensions,
    docs_extensions,
    assistantInstructions,
    assistantName,
    docsBoxPath,
    docsBoxFileLimit,
    docsBoxFileSizeLimit,
    uploadCodebase,
    convertCsvToJson,
    concatenateFilesWithinDirectory
};
