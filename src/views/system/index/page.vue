<template>
  <d2-container class="page">
      <div class="cover-content">
        <!-- 区块链元素图片 -->
        <img src="@/assets/image/blockchain-image.jpg" alt="区块链元素图片" class="blockchain-image">
        <h1 class="cover-title">多功能区块链漏洞检测修复平台</h1>
        <p class="cover-description">欢迎使用我们的平台，致力于解决区块链系统中的安全隐患</p>
        <!-- 点击按钮跳转到 contractUpload 页面 -->
        <el-dropdown @command="handleDropdownClicked">
          <el-button type="primary">
            上传智能合约项目<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command = 'multiple'>上传多文件项目</el-dropdown-item>
            <el-dropdown-item command = 'single'>上传单文件项目</el-dropdown-item>
            <el-dropdown-item command = 'verified'>已验证合约</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    <el-dialog
      :before-close="handleClose"
      title="提交多文件项目"
      :visible.sync="this.multipleDialogVisible"
      width="60%">
      <div style="height: 60vh">
        <el-row>
          <el-col :span="12">
            <el-row type="flex" justify="center">
              <el-upload
                ref="uploadZip"
                class="upload-demo"
                drag
                action="http://localhost:5000/uploadFile"
                :before-upload="beforeZipUpload"
                multiple
                :data="uploadData"
                :on-preview="handlePreview"
                :auto-upload = "false"
                :file-list="fileList">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将智能合约项目zip文件拖到此处，或<em>点击上传</em></div>
              </el-upload>
            </el-row>
          </el-col>
          <el-col :span="12">
            <el-row type="flex" justify="center" :gutter="20">
              <el-col :span="12">
                <el-input placeholder="请输入项目工作目录名" v-model="currentWorkDirectory">
                </el-input>
              </el-col>
              <el-col :span="12">
                <label>
                  请输入项目工作目录名
                </label>
              </el-col>
            </el-row>
            <el-row type="flex" justify="center" :gutter="20">
              <el-col :span="12">
                <el-input placeholder="请输入合约所在路径名" v-model="mainPath">
                </el-input>
              </el-col>
              <el-col :span="12">
                <label>
                  请输入合约所在路径名
                </label>
              </el-col>
            </el-row>
            <el-row type="flex" justify="center">
              <el-col :span="12">
                <el-button type="primary" @click="handleUploadZipButtonClicked" :loading="uploadZipButtonLoad">提交文件</el-button>
              </el-col>
              <el-col :span="12">
                <el-button type="primary" @click="handleDetectZipButtonClicked" :disabled="detectZipButtonDisabled" :loading="detectZipButtonLoad">检测文件</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row>
          <el-card style="height: 30vh">
            示例图片
          </el-card>
        </el-row>
      </div>
    </el-dialog>
    <el-dialog
      :before-close="handleClose"
      title="提交单文件项目"
      :visible.sync="this.singleDialogVisble"
      width="60%">
      <div style="height: 60vh">
        <el-row>
          <el-col :span="12">
            <el-row type="flex" justify="center">
              <el-upload
                ref="uploadSol"
                class="upload-demo"
                drag
                action="http://localhost:5000/uploadFile"
                :before-upload="beforeSolUpload"
                multiple
                :data="uploadData"
                :on-preview="handlePreview"
                :auto-upload = "false"
                :on-change="handleChange"
                :file-list="fileList">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将智能合约项目sol文件拖到此处，或<em>点击上传</em></div>
              </el-upload>
            </el-row>
          </el-col>
          <el-col :span="12">
            <el-row type="flex" justify="center">
              <el-col :span="12">
                <el-button type="primary" @click="handleUploadSolButtonClicked" :loading="uploadSolButtonLoad">提交文件</el-button>
              </el-col>
              <el-col :span="12">
                <el-button type="primary" @click="handleDetectSolButtonClicked" :disabled="detectSolButtonDisabled" :loading="detectSolButtonLoad">开始检测</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row>
          <el-card style="height: 30vh">
            示例图片
          </el-card>
        </el-row>
      </div>
    </el-dialog>
  </d2-container>
</template>
<script>

export default {
  name: 'index',
  data () {
    return {
      uploadZipButtonLoad: false,
      detectZipButtonLoad: false,
      detectZipButtonDisabled: true,
      uploadSolButtonLoad: false,
      detectSolButtonLoad: false,
      detectSolButtonDisabled: true,
      uploadData: Object,
      multipleDialogVisible: false,
      singleDialogVisble: false,
      verifiedDialogVisble: false,
      currentWorkDirectory: 'SushiMaker',
      mainPath: 'contracts',
      fileName: '',
      fileList: []
    }
  },
  mounted () {
    this.uploadData = { userName: this.$store.state.d2admin.user.info.name }
  },
  methods: {
    handleChange (file, fileList) {
      this.fileName = fileList[0].name
    },
    handlePreview (file) {
      console.log(file)
    },
    beforeZipUpload (file) {
      const isBinOrSol = file.name.endsWith('.zip')// || file.name.endsWith('.pdf')
      if (!isBinOrSol) {
        this.$message.error('只能上传 .zip格式的文件')
        return false
      }
      // 大小限制
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 2MB')
        return false
      }
      return true
    },
    beforeSolUpload (file) {
      const isBinOrSol = file.name.endsWith('.sol')// || file.name.endsWith('.pdf')
      if (!isBinOrSol) {
        this.$message.error('只能上传 .sol格式的文件')
        return false
      }
      // 大小限制
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 2MB')
        return false
      }
      return true
    },
    handleExceed (files, fileList) {
      this.$message.warning('只能上传一份文件')
    },
    handleUploadZipButtonClicked () {
      this.uploadZipButtonLoad = true
      this.$refs.uploadZip.submit()
      this.uploadZipButtonLoad = false
      this.detectZipButtonDisabled = false
    },
    async handleDetectZipButtonClicked () {
      this.detectZipButtonLoad = true
      var jsonObject = {
        userName: this.$store.state.d2admin.user.info.name,
        currentWorkDirectory: this.currentWorkDirectory,
        mainPath: this.mainPath
      }
      const db = await this.$store.dispatch('d2admin/db/database', {
        user: true
      })
      db.set('currentWorkDirectory', this.currentWorkDirectory).write()
      db.set('mainPath', this.mainPath).write()
      fetch('http://localhost:5000/slither', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonObject)
      })
        .then(text => {
          this.$router.push('../detect/detectResult')
        })
    },
    handleUploadSolButtonClicked () {
      this.uploadSolButtonLoad = true
      console.log(this.fileName)
      this.$refs.uploadSol.submit()
      this.uploadSolButtonLoad = false
      this.detectSolButtonDisabled = false
    },
    async handleDetectSolButtonClicked () {
      this.detectSolButtonLoad = true
      var jsonObject = {
        userName: this.$store.state.d2admin.user.info.name,
        currentWorkDirectory: this.fileName.split('.')[0],
        mainPath: ''
      }
      const db = await this.$store.dispatch('d2admin/db/database', {
        user: true
      })
      db.set('currentWorkDirectory', this.fileName.split('.')[0]).write()
      db.set('mainPath', '').write()
      fetch('http://localhost:5000/slither', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonObject)
      })
        .then(text => {
          this.$router.push('../detect/detectResult')
        })
    },
    handleDropdownClicked (command) {
      switch (command) {
        case 'multiple':
          this.multipleDialogVisible = true
          break
        case 'single':
          this.singleDialogVisble = true
          break
        case 'verified':
          this.verifiedDialogVisble = true
          break
      }
    },
    handleClose () {
      this.multipleDialogVisible = false
      this.singleDialogVisble = false
      this.verifiedDialogVisble = false
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.page {
  // 设置背景图片
  background-image: url('../../../assets/image/background.jpg');
  background-size: cover; // 背景图片尺寸适应容器大小
  background-position: center; // 背景图片居中对齐
  background-repeat: no-repeat; // 不重复平铺背景图片

  .cover-content {
    text-align: center;
    padding: 40px;
  }
  .blockchain-image {
    max-width: 50%; /* 设置图片最大宽度为父元素宽度的一半 */
    height: auto; /* 根据宽度自动调整高度 */
    margin-bottom: 20px;
  }
  .cover-title {
    font-size: 36px;
    color: #333;
    margin-bottom: 20px;
  }
  .cover-description {
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
  }
}
</style>
