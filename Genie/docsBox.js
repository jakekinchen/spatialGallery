import {docsBoxPath,docsBoxFileLimit,docsBoxFileSizeLimit} from './config.js'

class docsBox {
    constructor() {
        this.path = docsBoxPath
        this.files = []
        this.directories = []
        this.size = 0
        this.sizeLimit = docsBoxFileSizeLimit
        this.fileLimit = docsBoxFileLimit
    }
    addFile(file) {
        this.files.push(file)
        this.size += file.size
    }
    addDirectory(directory) {
        this.directories.push(directory)
        this.size += directory.size
    }
}