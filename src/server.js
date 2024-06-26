const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const app = express()
app.use(cors())
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
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('test')
  if (req.file) {
    console.log(`文件上传成功：${req.file.originalname}`)
    res.send('文件上传成功')
  } else {
    console.log('文件上传失败')
    res.status(400).send('文件上传失败')
  }
})

// 创建uploads文件夹
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

app.listen(port, () => {
  console.log(`文件上传服务器正在运行在 http://localhost:${port}`)
})
