<template>
  <d2-container class="page">
      <div class="cover-content">
        <!-- 区块链元素图片 -->
        <img src="@/assets/image/blockchain-image.jpg" alt="区块链元素图片" class="blockchain-image">
        <h1 class="cover-title">多功能区块链漏洞检测修复平台</h1>
        <p class="cover-description">欢迎使用我们的平台，致力于解决区块链系统中的安全隐患。</p>
        <!-- 点击按钮跳转到 contractUpload 页面 -->
        <el-dropdown @command="handleDropdownClicked">
          <el-button type="primary">
            更多菜单<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command = 'multiple'>上传多文件项目</el-dropdown-item>
            <el-dropdown-item command = 'single'>上传单文件项目</el-dropdown-item>
            <el-dropdown-item command = 'verified'>已验证合约</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    <el-dialog
      title="提交多文件项目"
      :visible.sync="this.multipleDialogVisible"
      width="60%">
      <d2-container style="height: 80vh">
        <el-row>
          <h1>上传智能合约字节码文件</h1>
          <el-col :offset="8">
            <el-upload
              ref="upload"
              class="upload-demo"
              drag
              action="http://localhost:5000/uploadFile"
              :data=this.$store.state.d2admin.user.info
              :before-upload="beforeUpload"
              multiple
              :on-preview="handlePreview"
              :auto-upload = "false"
              :file-list="fileList">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将智能合约字节码文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-col>
        </el-row>
        <el-row>
          <el-col type="flex" justify="center" align="middle">
            <el-button type="primary" @click="detect">检测合约</el-button>
          </el-col>
        </el-row>
      </d2-container>
    </el-dialog>
  </d2-container>
</template>
<script>

export default {
  name: 'index',
  data () {
    return {
      multipleDialogVisible: false,
      singleDialogVisble: false,
      verifiedDialogVisble: false
    }
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss" scoped>
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
  .cover-button {
    font-size: 18px;
  }
  .btn-group {
    color: #666;
    font-size: 12px;
    line-height: 12px;
    margin-top: 20px;
    .btn-group__btn {
      color: #666;
      &:hover {
        color: #409EFF;
      }
    }
  }
}
</style>
