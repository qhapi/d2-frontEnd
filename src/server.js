const express = require('express')
const multer = require('multer')
const { spawn } = require('child_process')
const fs = require('fs')
const AdmZip = require('adm-zip')
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
const pythonPath = 'D://anaconda3//envs//blockChainPlatform//python.exe'
// 设置存储文件的目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userName = req.body.userName
    const dir = `${__dirname}/uploads/${userName}/`
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        cb(err)
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
    if (path.extname(req.file.originalname).toLowerCase() === '.zip') {
      const zip = new AdmZip(req.file.path)
      const extractPath = path.join(path.dirname(req.file.path), path.basename(req.file.originalname, '.zip'))
      fs.mkdirSync(extractPath, { recursive: true })
      zip.extractAllToAsync(extractPath, true, (err) => {
        if (err) {
          res.status(500).send('解压文件失败')
        }
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Failed to delete the file:', err)
          }
          console.log('File deleted successfully')
        })
        res.send('文件上传并解压成功')
      })
    } else {
      const extractPath = path.join(path.dirname(req.file.path), path.basename(req.file.originalname, '.sol'))
      fs.mkdirSync(extractPath, { recursive: true })
      fs.rename(req.file.path, path.join(extractPath, req.file.originalname), (err) => {
        if (err) {
          console.error('Failed to copy file:', err)
        }
        console.log('File copied successfully')
      })
      res.send('文件上传成功')
    }
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
  const args = ['-m', 'slither', `${cwd}${mainPath}`, '--json', 'result.json']
  const solcPath = 'D://anaconda3//envs//blockChainPlatform//Scripts//solc.exe'
  const options = {
    cwd: cwd
  }
  const pythonProcess = spawn(pythonPath, args, options)
  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })
  pythonProcess.on('error', (error) => {
    console.error('Failed to start subprocess:', error)
  })
  pythonProcess.on('close', (code) => {
    const parseProcess = spawn(pythonPath, [`${__dirname}\\uploads\\report2file.py`, `${__dirname}\\uploads\\${userName}\\${currentWorkDirectory}\\result.json`], options)
    parseProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`)
    })
    parseProcess.on('error', (error) => {
      console.error('Failed to start subprocess:', error)
    })
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

app.post('/getMockCode', (req, res) => {
  const { fileName } = req.body
  // 根据文件名生成模拟代码
  const code = generateMockCode(fileName)
  res.send(code)
  console.log(code)
  console.log('yes')
})

// 模拟的置信度数据
const confidenceData = {
  'ContractA.sol': {
    1: 0.9,
    2: 0.85,
    3: 0.95
  },
  'ContractB.sol': {
    1: 0.7,
    2: 0.8,
    3: 0.6
  }
}

// 模拟代码
function generateMockCode (fileName) {
  let code = `// ${fileName}
pragma solidity ^0.8.0;

contract ${fileName.replace('.sol', '')} {
`

  for (let i = 1; i <= 5; i++) {
    code += `  // Line ${i}
  function line${i}() public pure {
    // Some code here
  }

`
  }

  code += '}'
  return code
}

app.post('/getConfidence', (req, res) => {
  const { fileName, lineNumber } = req.body
  const confidence = confidenceData[fileName][lineNumber.toString()]
  if (confidence !== undefined) {
    res.send({ confidence })
  } else {
    res.status(404).send({ message: 'Confidence not found' })
  }
})

app.listen(port, () => {
  console.log(`文件上传服务器正在运行在 http://localhost:${port}`)
})
