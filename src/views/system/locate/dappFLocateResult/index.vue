<template>
  <el-container>
    <el-aside style="height: 100vh; color: white">
          <el-menu>
            <el-submenu v-for="(result, i) in faults" :key="i" :index='`${i+1}`'>
              <template slot="title" >
                <span style="float:left; font-weight:bold; font-size:14px; color:#2C8DF4;">
                  {{ `Top-${i + 1}` }}
                </span>
              </template>
              <el-menu-item @click=showCode(i)>{{result.description}}</el-menu-item>
            </el-submenu>
          </el-menu>

    </el-aside>
    <el-main>
      <d2-highlight :code=codeShow></d2-highlight>
    </el-main>
  </el-container>
</template>

<script>

import { parseInt } from 'lodash'

export default {
  name: 'dappFLocateResult',

  data () {
    return {
      results: [], // 保存检测结果
      faults: [], // 保存 requestFaults 获取的数据
      codeShow: ''
    }
  },
  created () {
    this.showContracts()
  },
  methods: {
    async showContracts () {
      const db = await this.$store.dispatch('d2admin/db/database', {
        user: true
      })
      const faultLines = db.get('data').value().split('\n')
      for (let i = 0; i < faultLines.length - 1; i++) {
        const values = faultLines[i].split(',')
        this.faults.push({
          rank: values[0],
          description: values[1],
          address: values[2],
          offset: values[3]
        })
      }
    },
    showCode (index) {
      const axios = require('axios')
      const params = {
        module: 'contract',
        action: 'getsourcecode',
        address: this.faults[index].address,
        apikey: 'ETU946475U9T641V6AYCMPH6YXSRSBVNXH'
      }
      console.log(params)
      const client = axios.create({
        baseURL: 'https://api.etherscan.io/api',
        timeout: 10000,
        proxy: {
          host: '127.0.0.1',
          port: 7890
        }
      })
      const begin = parseInt(this.faults[index].offset.split(':')[0], 10)
      const end = begin + parseInt(this.faults[index].offset.split(':')[1], 10)
      client.get('', { params })
        .then(response => {
          const jsonString = response.data.result[0].SourceCode.slice(1, -1).trim()
          const jsonObject = JSON.parse(jsonString)
          const snippet1 = jsonString.slice(begin, end)
          const snippet2 = JSON.stringify(jsonObject.sources).slice(begin, end)
          console.log(jsonObject)
          console.log(jsonString)
          console.log(snippet1)
          console.log(snippet2)
          console.log(begin)
          console.log(end)
          this.codeShow = snippet1.replace(/\\n/g, '\n')
        })
        .catch(error => {
          console.error('API Request Failed:', error)
        })
    }
  }
}

</script>
<style>
body, html, #app {
  height: 100%;
  margin: 0;
}
</style>
