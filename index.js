import { createChunk } from './createChunk.js'
import { cutFile } from './cutFile.js'
import SparkMD5 from './spark-md5.js'


const upload = document.getElementById('upload')

const createFileHash = (file) => {
    return new Promise((resolve) => {
        const spark = new SparkMD5.ArrayBuffer()
        const fileReader = new FileReader()
        fileReader.onload = (e) => {
            spark.append(e.target.result)
            const fileHash = spark.end()
            resolve(fileHash)
        }
        fileReader.readAsArrayBuffer(file)
    })
}

const uploadFile = () => {
    const promiseList = []
    for (let i = 0; i < chunks.length; i++) {
        const formData = new FormData()
        console.log(chunks[i]);
        formData.append('filename', fileName)
        formData.append('filehash', fileHash)
        formData.append('blob', chunks[i].blob)
        formData.append('index', chunks[i].index)
        formData.append('hash', chunks[i].hash)

        promiseList.push(fetch('http://localhost:3000/upload', {
            method: 'post',
            body: formData,
        }))
    }
    Promise.all(promiseList).then(res=>{
        console.log(res.length);
        fetch('http://localhost:3000/merge', {
            method: 'post',
            body: JSON.stringify({
                fileHash: fileHash,
                fileName: fileName,
                size: 2 * 1024 * 1024
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    })
}



upload.onchange = async (e) => {
    const file = e.target.files[0]
    const fileHash = await createFileHash(file)
    const fileName = file.name
    const chunks = await cutFile(file)
}

