const express = require('express')
// const multer = require('multer')
const multiparty = require('multiparty')
// const upload = multer({
//     dest: 'uploads/'
// })
const fs = require('node:fs')
const path = require('node:path')

const app = express()
const prot = 3000

app.use(express.json());

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
  });


app.get('/', (req, res) => {
    res.send('hello')
})
app.post('/upload', async (req, res, next) => {
    const multipart = new multiparty.Form()
    multipart.parse(req, async (err, field, files) => {
        const [chunk] = files.blob
        const [fileName] = field.filename
        const [fileHash] = field.filehash
        const [chunkHash] = field.hash
        const [index] = field.index

        const fileDir = path.resolve('uploads', fileHash)
        const filePath = path.resolve(fileDir, fileName)
        const chunkDir = path.resolve('uploads', fileHash, 'chunk')
        if (!fs.existsSync(path.resolve('uploads'))) {
            fs.mkdirSync(path.resolve('uploads'))
        }
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir)
        }
        if (!fs.existsSync(chunkDir)) {
            fs.mkdirSync(chunkDir)
        }
        // 保存切片
        fs.copyFileSync(`${chunk.path}`, `${chunkDir}/${index}-${chunkHash}`)
        res.send({
            code: 200
        })
    })
})

app.post('/merge', (req, res) => {
    const fileHash = req.body.fileHash
    const fileName = req.body.fileName
    const size = req.body.size
    const filePath = path.resolve('uploads', fileHash, fileName)
    const chunkDir = path.resolve('uploads', fileHash, 'chunk')
    mergeChunk(filePath, chunkDir, size)
    res.send({
        code: 200
    })
})

app.listen(prot, () => {
    console.log('run server: http://localhost:3000');
})

const pipeStream = (readStream, writeStream) => {
    return new Promise((resolve) => {
        readStream.on('end', () => {
            resolve()
        })
        readStream.pipe(writeStream)
    })
}


const mergeChunk = (path, chunkDir, size) => {
    return new Promise((resolve) => {
        // 获取全部chunk
        const chunks = fs.readdirSync(chunkDir)
        const orderlyChunks = chunks.sort((a, b) => {
            return a.split('-')[0] - b.split('-')[0]
        })
        orderlyChunks.map(async (chunk, index) => {
            const writeStream = fs.createWriteStream(path, {
                start: index * size,
                end: (index + 1) * size
            })
            const readStream = fs.createReadStream(`${chunkDir}/${chunk}`)
            await pipeStream(readStream, writeStream)
        })
    })
}