<template>
  <d2-container>
    <!-- 文件上传区域 -->
    <el-row>
      <h1>上传智能合约字节码文件</h1>
      <el-col>
        <el-upload
          class="upload-demo"
          drag
          action
          :http-request="httpRequest"
          :before-upload="beforeUpload"
          multiple
          :file-list="form.fileList">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将智能合约字节码文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-col>
    </el-row>

    <!-- 检测按钮区域 -->
    <el-row>
      <el-col type="flex" justify="center" align="middle">
        <el-button type="primary" @click="detect">检测合约</el-button>
      </el-col>
    </el-row>
  </d2-container>
</template>

<script>
import axios from 'axios' // 导入 Axios 库，用于发送 HTTP 请求
import { mapState } from 'vuex' // 从 Vuex 中导入 mapState 函数，用于将 Vuex 中的状态映射到组件的计算属性中

export default {
  name: 'ContractUpload',

  data () {
    return {
      form: { // form 对象，包含合约文件信息
        fileList: [] // 文件列表
      }
    }
  },

  computed: {
    ...mapState('d2admin/user', ['info'])
  },

  methods: {
    // 上传文件之前的钩子函数，用于处理文件类型和大小等限制
    beforeUpload (file) {
      const isBinOrSol = file.name.endsWith(".bin") || file.name.endsWith(".sol")
      if (!isBinOrSol) {
        this.$message.error('只能上传 .bin 或 .sol 格式的文件')
        return false
      }
      //大小限制
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 2MB')
        return false
      }
      return true
    },

    // 文件超出个数限制的处理函数
    handleExceed (files, fileList) {
      this.$message.warning(`只能上传一份文件`)
    },

    // 处理上传文件的方法
    httpRequest (option) {
      // 模拟上传文件的请求，实际项目中需要根据后端接口进行相应处理
      setTimeout(() => {
        this.form.fileList.push(option)
      }, 500)
    },

    // 跳转到检测结果页面的方法
    detect () {
      // 这里是你跳转到检测结果页面的代码，需要根据实际情况修改
      this.$router.push('detectResult')
    }
  }
}
</script>

<style scoped>
/* 可以添加一些样式来美化上传文件区域 */
.upload-demo {
  margin-top: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  padding: 20px;
  text-align: center;
}
</style>




