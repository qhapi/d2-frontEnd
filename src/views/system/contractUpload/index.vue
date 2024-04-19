<template>
  <d2-container>
    <el-row>
      <h1>上传合约文件</h1>
      <el-col>
        <el-upload
          class="upload-demo"
          drag
          action
          :http-request="httpRequest"
          multiple>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将合约文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-col>
    </el-row>
      <el-row>
        <el-col :span="8"><div class="grid-content"></div></el-col>
        <el-col :span="4"><el-button type="primary" @click="detail">检测合约</el-button></el-col>
      </el-row>
  </d2-container>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'contractUpload',
  data () {
    return {
      channels: [],
      form: {
        name: '',
        init: 'randomized',
        desc: '',
        fileList: []
      }
    }
  },
  created () {
    this.channels = []
  },
  computed: {
    ...mapState('d2admin/user', [
      'info'
    ])
  },
  methods: {
    enroll (channelname) {
      axios.post('/api/enroll', { uid: this.info.name, channelname: channelname, port: this.info.port, hostname: this.info.hostname }, { emulateJSON: true }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } }
      ).then(response => {
        console.log('加入成功')
      })
    },
    detail () {
      this.$router.push('detectResult')
    },
    httpRequest (option) {
      this.form.fileList.push(option)
    }
  }
}
</script>
