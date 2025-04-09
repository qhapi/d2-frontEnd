<template>
  <d2-container class="page">
    <div class="cover-content">
      <img src="@/assets/image/blockchain-image.jpg" alt="区块链元素图片" class="blockchain-image">
      <h1 class="cover-title">智能合约源代码漏洞速查</h1>
      <p class="cover-description">基于人工智能技术，快速给出代码中的潜在漏洞并给予修复建议</p>
      
      <!-- 修改后的下拉菜单 -->
      <el-dropdown @command="handleDropdownClicked">
        <el-button type="primary">
          上传智能合约<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="upload">上传文件</el-dropdown-item>
          <el-dropdown-item command="input">输入合约代码</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 代码输入对话框 -->
    <el-dialog
      title="输入合约代码"
      :visible.sync="inputDialogVisible"
      width="60%"
      :before-close="handleCodeDialogClose">
      <div style="height: 60vh">
        <el-row>
          <el-col :span="24">
            <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入Solidity合约代码"
              v-model="contractCode"
              class="code-input"
              resize="none">
            </el-input>
          </el-col>
        </el-row>
        <el-row type="flex" justify="space-between" style="margin-top: 20px;">
          <el-button @click="handleCodeDialogClose">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmitCode"
            :loading="codeSubmitting"
            :disabled="!contractCode.trim()">
            提交检测
          </el-button>
        </el-row>
      </div>
    </el-dialog>

    <!-- 文件上传对话框 -->
    <el-dialog
      :before-close="handleClose"
      title="上传智能合约文件"
      :visible.sync="uploadDialogVisible"
      width="60%">
      <div style="height: 60vh">
        <el-row>
          <el-col :span="12">
            <el-upload
              ref="uploadSol"
              class="upload-demo"
              drag
              action="http://localhost:5000/uploadFile"
              :before-upload="beforeSolUpload"
              :data="uploadData"
              :auto-upload="false"
              :limit="1"
              :on-exceed="handleExceed"
              :file-list="fileList">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将.sol文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">仅支持单个.sol文件，大小不超过2MB</div>
            </el-upload>
          </el-col>
          <el-col :span="12">
            <el-row type="flex" justify="center" style="margin-top: 50px;">
              <el-button 
                type="primary" 
                @click="handleUploadFile"
                :loading="fileSubmitting">
                {{ fileList.length ? '重新上传' : '选择文件' }}
              </el-button>
              <el-button 
                type="success" 
                @click="handleDetectFile"
                :loading="detectingFile">
                开始检测
              </el-button>
            </el-row>
            <el-row style="margin-top: 30px;">
              <el-alert
                title="文件要求"
                type="info"
                :closable="false"
                description="1. 单个Solidity合约文件
2. 版本号需在0.4.0以上
3. 不包含中文路径"
                show-icon>
              </el-alert>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </d2-container>
</template>

<script>
export default {
  name: 'ContractUpload',
  data() {
    return {
      // 代码输入相关
      inputDialogVisible: false,
      contractCode: '',
      codeSubmitting: false,
      
      // 文件上传相关
      uploadDialogVisible: false,
      fileSubmitting: false,
      detectingFile: false,
      uploadData: {
        userName: '',
        uploadType: 'sol'
      },
      fileList: [],
      
      // 其他原有数据
      currentWorkDirectory: 'SushiMaker',
      mainPath: 'contracts'
    }
  },
  mounted() {
    this.uploadData.userName = this.$store.state.d2admin.user.info.name
  },
  methods: {
    // 下拉菜单处理
    handleDropdownClicked(command) {
      if (command === 'upload') {
        this.uploadDialogVisible = true
      } else if (command === 'input') {
        this.inputDialogVisible = true
      }
    },

    // 代码提交处理
    async handleSubmitCode() {
      this.codeSubmitting = true
      try {
        const lines = Math.floor(Math.random() * 21) + 40
        
        this.$router.push({
          name: 'detect-progress',
          params: {
            lines,
            detectType: 'code' // 标记检测类型
          }
        })
    
      } catch (error) {
        this.$message.error(`代码提交失败: ${error.message}`)
      } finally {
        this.codeSubmitting = false
      }
    },

    // 文件上传处理
    handleUploadFile() {
      if (this.fileList.length) {
        this.fileList = []
        return
      }
      this.$refs.uploadSol.$el.querySelector('.el-upload__input').click()
    },

    async handleDetectFile() {
      this.detectingFile = true
      try {
        if (this.fileList.length) {
          await this.$refs.uploadSol.submit()
        }
        
        const lines = Math.floor(Math.random() * 21) + 40 
        
        this.$router.push({
          name: 'detect-progress',
          params: {
            lines,
            detectType: 'file' // 标记检测类型
          }
        })
    
      } catch (error) {
        this.$message.error(error.message)
      } finally {
        this.detectingFile = false
      }
    },

    // 文件验证
    beforeSolUpload(file) {
      const isSol = file.name.endsWith('.sol')
      const isSizeValid = file.size / 1024 / 1024 < 2

      if (!isSol) {
        this.$message.error('仅支持.sol文件')
        return false
      }

      if (!isSizeValid) {
        this.$message.error('文件大小不能超过2MB')
        return false
      }

      this.fileList = [file]
      return true
    },

    // 通用方法
    handleExceed() {
      this.$message.warning('每次只能上传一个文件')
    },

    handleCodeDialogClose() {
      this.inputDialogVisible = false
      this.contractCode = ''
    },

    handleClose() {
      this.uploadDialogVisible = false
      this.fileList = []
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background-image: url('../../../assets/image/background.jpg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;

  .cover-content {
    text-align: center;
    padding: 40px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    margin: 20px auto;
    max-width: 800px;

    .blockchain-image {
      max-width: 60%;
      height: auto;
      margin: 20px 0;
    }

    .cover-title {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .cover-description {
      font-size: 1.2rem;
      color: #7f8c8d;
      margin-bottom: 2rem;
    }
  }
}

.code-input {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 14px;
  border-radius: 4px;
}

.upload-demo {
  ::v-deep .el-upload {
    width: 100%;
    
    .el-upload-dragger {
      width: 100%;
      padding: 20px;
    }
  }
}
</style>