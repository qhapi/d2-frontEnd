const express = require('express')
const multer = require('multer')
const { spawn } = require('child_process');
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(cors())
app.use(bodyParser.json({limit: '1mb'}))

const port = 5000

// 设置存储文件的目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 文件存储在项目目录下的uploads文件夹中
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // 保留文件的原始名称
  }
})

const upload = multer({ storage: storage })

// 处理文件上传的路由
app.post('/uploadFile', upload.single('file'), (req, res) => {
  console.log('test')
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
  const { faultTxHash, faultlessTxHash } = req.body;

  // 设置 Python 脚本路径和参数
  const pythonPath = 'D:\\anaconda3\\envs\\VulDetector\\python.exe';
  const scriptPath = 'D:\\DAPPFL\\locate.py';
  const args = [
    '--fault_txhash', faultTxHash,
    '--faultless_txhash', faultlessTxHash,
    '--net', 'Ethereum',
    '--model_path', 'D:\\DAPPFL\\misc\\model.pth',
    '--p_norm', '6'
  ];
  console.log('running')
  const pythonProcess = spawn(pythonPath, [scriptPath, ...args]);

  let outputData = '';
  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.send(outputData);
    } else {
      res.status(500).send(`Python script exited with code ${code}`);
    }
  });
});

// 创建uploads文件夹
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

app.listen(port, () => {
  console.log(`文件上传服务器正在运行在 http://localhost:${port}`)
})
