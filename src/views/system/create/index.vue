<template>
  <d2-container>
    <h1>请先进行漏洞发掘</h1>
    <input type="text" id="vueTextbox" v-model="inputText">
  </d2-container>
</template>

<script>
import axios from 'axios'
export default {
  name: 'create',
  data () {
    return {
      inputText: 'test',
      form: {
        name: '',
        init: 'randomized',
        desc: '',
        fileList: []
      }
    }
  },
  methods: {
    onSubmit () {
      console.log(this.form)
      axios.post('/api/create', this.form, { emulateJSON: true }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } }
      ).then(response => {
        console.log('提交成功')
      })
    },
    httpRequest (option) {
      this.form.fileList.push(option)
    }
  }
}
</script>
