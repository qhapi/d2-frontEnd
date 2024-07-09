const express = require('express')
const multer = require('multer')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(cors())
app.use(bodyParser.json({ limit: '1mb' }))

const port = 5000
const pythonPath = 'D:\\anaconda3\\envs\\VulDetector\\python.exe'
// 设置存储文件的目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userName = req.body.name
    const dir = `${__dirname}/uploads/${userName}/`
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        return cb(err)
      }
      cb(null, dir)
    })
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // 保留文件的原始名称
  }
})

const upload = multer({ storage: storage })

// 处理文件上传的路由
app.post('/uploadFile', upload.single('file'), (req, res) => {
  if (req.file) {
    console.log(`文件上传成功：${req.file.originalname}`)
    res.send('文件上传成功')
  } else {
    console.log('文件上传失败')
    res.status(400).send('文件上传失败')
  }
})

app.post('/uploadAddress', (req, res) => {
  // 从请求体中获取参数
  const { faultTxHash, faultlessTxHash } = req.body
  const scriptPath = 'D:\\DAPPFL\\locate.py'
  const args = [
    '--fault_txhash', faultTxHash,
    '--faultless_txhash', faultlessTxHash,
    '--net', 'Ethereum',
    '--model_path', 'D:\\DAPPFL\\misc\\model.pth',
    '--p_norm', '6'
  ]
  console.log('running')
  // 启动 Python 子进程
  const pythonProcess = spawn(pythonPath, [scriptPath, ...args])

  let outputData = ''
  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString()
  })

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.send(outputData)
    } else {
      res.status(500).send(`Python script exited with code ${code}`)
    }
  })
})
app.post('/slither', (req, res) => {
  const { userName, currentWorkDirectory, mainPath } = req.body
  const cwd = `${__dirname}\\uploads\\${userName}\\${currentWorkDirectory}\\`
  const args = ['-m', 'slither.__main__', `${cwd}${mainPath}`, '--json', 'result.json']
  const options = {
    cwd: cwd
  }
  console.log(cwd)
  console.log(args)
  // 启动 Python 子进程
  const pythonProcess = spawn(pythonPath, args, options)
  pythonProcess.on('close', (code) => {
    const parseProcess = spawn(pythonPath, [`${__dirname}\\uploads\\report2file.py`, `${__dirname}\\uploads\\${userName}\\${currentWorkDirectory}\\result.json`], options)
    parseProcess.on('close', (code) => {
      res.send('6')
    })
  })
})
app.post('/getSlitherJSON', (req, res) => {
  const { userName, currentWorkDirectory } = req.body
  const resultPath = path.join(__dirname, 'uploads', userName, currentWorkDirectory, 'result_file.json')
  fs.readFile(resultPath, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      console.error('reading', err)
    }
    const jsonData = JSON.parse(data)
    res.send(jsonData)
  })
})

app.post('/getSourceCode', (req, res) => {
  const { userName, currentWorkDirectory, fileName } = req.body
  const resultPath = path.join(__dirname, 'uploads', userName, currentWorkDirectory, fileName)
  fs.readFile(resultPath, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      console.error('reading', err)
    }
    res.send(data)
  })
})
app.listen(port, () => {
  console.log(`文件上传服务器正在运行在 http://localhost:${port}`)
})
