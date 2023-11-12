code_extensions = ['.js', '.css', '.jsx', '.tsx', '.ts', '.html', '.json', '.md' ] // Extensions of code files to include in the codebase json in docsBox
docs_extensions = ['pdf', 'txt', 'docx', 'doc', 'csv', 'xls', 'xlsx', 'rtf', 'pptx', 'ppt', 'md']  // Extensions of docs files to include in the docs json in docsBox
assistantDesription = 'Assistant to help with codebase'
assistantInstructions = 'Help the user with the codebase'
assistantName = 'GenieGPT'


const docsBoxPath = './docsBox' // Warning: Using a custom docsBox path is not recommended unless you know what you are doing
const docsBoxFileLimit = 20 // Max number of files to include in docsBox per OpenAI 
const docsBoxFileSizeLimit = 536870912 // Max size of a file to include in docsBox per OpenAI (512MB)

// Declare a boolean named uploadCodebase to determine whether to upload codebase or not
const uploadCodebase = false

module.exports = {
    code_extensions,
    docs_extensions,
    assistantDesription,
    assistantInstructions,
    assistantName,
    docsBoxPath,
    docsBoxFileLimit,
    docsBoxFileSizeLimit,
    uploadCodebase
}