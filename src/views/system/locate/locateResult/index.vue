<template>
  <d2-container>
    <el-container>
      <el-aside width="450px" style="max-height: 84vh">
        <el-menu unique-opened @open="showCode" ref="menu">
          <el-submenu v-for="(contract, i) in contracts" :key="i" :index='`${i}`' @click="showCode(contract)">
            <template slot="title" >
                <span style="float:left; font-weight:bold; font-size:14px; color:#2C8DF4;">
                  {{ contract }}
                </span>
            </template>
            <el-menu-item v-for="(fault, j) in getFaults(contract)" :key="j" @click="handleMenuItemClicked(fault)">
              {{`${fault.check}:${fault.lines[0]}-${fault.lines[fault.lines.length-1]}`}}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main style="max-height: 84vh">
        <el-card style="position: fixed; z-index: 100; bottom: 20px; width: 120vh">
          <h1 style="position: relative">
            漏洞描述
            <el-button style="right: 20px; position: absolute" @click="dappScanVisible = true">
            通过交易地址快速定位
            </el-button>
          </h1>
          <el-divider/>
          <el-row>
            {{this.description}}
          </el-row>
        </el-card>
        <div>
          <d2-highlight :code=codeShow :redLines=this.redLines></d2-highlight>
        </div>
      </el-main>
    </el-container>
    <el-dialog
    title="DappSCAN"
    :visible.sync="dappScanVisible"
    :before-close="handleClose"
    width="60%">
      <transaction-upload/>
    </el-dialog>
  </d2-container>
</template>

<script>
import TransactionUpload from '@/views/system/locate/transactionUpload/index.vue'

export default {
  name: 'locateResult',
  components: { TransactionUpload },

  data () {
    return {
      dappScanVisible: false,
      description: '',
      db: null,
      redLines: [],
      contracts: [],
      jsonData: {},
      codeShow: ''
    }
  },
  async created () {
    this.db = await this.$store.dispatch('d2admin/db/database', {
      user: true
    })
    this.getJSON()
  },
  methods: {
    handleClose () {
      this.dappScanVisible = false
    },
    getJSON () {
      fetch('http://localhost:5000/getSlitherJSON', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: this.$store.state.d2admin.user.info.name,
          currentWorkDirectory: this.db.get('currentWorkDirectory')
        })
      })
        .then(response => response.json())
        .then(jsonData => {
          Object.keys(jsonData).forEach(file => {
            this.contracts.push(file)
          })
          this.jsonData = jsonData
        })
    },
    getFaults (contract) {
      return this.jsonData[contract]
    },
    showCode (index, indexPath) {
      fetch('http://localhost:5000/getSourceCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: this.$store.state.d2admin.user.info.name,
          currentWorkDirectory: this.db.get('currentWorkDirectory').value(),
          fileName: this.contracts[index]
        })
      })
        .then(response => response.text())
        .then(text => {
          this.codeShow = text
        })
    },
    handleMenuItemClicked (fault) {
      this.redLines = fault.lines
      this.description = fault.description
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
