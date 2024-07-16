<template>
  <div>
    <el-row v-for="(input, index) in faultless_txhashs" :key="index">
      <el-col :offset="6" :span="12">
        <el-input
          :placeholder="input.placeholder"
          v-model="input.model"
          clearable>
        </el-input>
      </el-col>
    </el-row>
    <el-divider/>
    <el-row v-for="(input2, index2) in fault_txhashs" :key="index2">
      <el-col :offset="6" :span="12" >
        <el-input
          :placeholder="input2.placeholder"
          v-model="input2.model"
          clearable>
        </el-input>
      </el-col>
    </el-row>

    <el-row>
      <el-col span="12" offset="12">
        <el-button icon="el-icon-plus" @click="addFaultlessInput">增加正确交易地址</el-button>
        <el-button icon="el-icon-plus" @click="addFaultInput">增加故障交易地址</el-button>
        <el-button @click="buttonClicked" :loading="buttonLoad">开始定位</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'TransactionUpload',

  data () {
    return {
      faultless_txhashs: [
        { placeholder: '请输入正常交易地址', model: '0x7df39084b561ee2e7809e690f11e8e258dc65b6128399acbacf1f2433308de6a' },
        { placeholder: '请输入正常交易地址', model: '0xddd734c1f3e097d3d1cdd7d4c0ffae166b39992a1d055008bf6660b8c0b7582e' },
        { placeholder: '请输入正常交易地址', model: '0x5c1d151599bbacc19a09dfee888d3be2ccf3e2fa781679b9e0970e18b3300e44' }

      ],
      fault_txhashs: [
        { placeholder: '请输入故障交易地址', model: '0x90fb0c9976361f537330a5617a404045ffb3fef5972cf67b531386014eeae7a9' }
      ],
      buttonLoad: false
    }
  },

  methods: {
    addFaultlessInput () {
      this.faultless_txhashs.push({ placeholder: '请输入正常交易地址', model: '' })
    },
    addFaultInput () {
      this.fault_txhashs.push({ placeholder: '请输入故障交易地址', model: '' })
    },
    buttonClicked () {
      this.buttonLoad = true
      const faultTxHash = this.fault_txhashs.filter(input => input.model).map(input => input.model).join(',')
      const faultlessTxHash = this.faultless_txhashs.filter(input => input.model).map(input => input.model).join(',')
      fetch('http://localhost:5000/uploadAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          faultTxHash: faultTxHash,
          faultlessTxHash: faultlessTxHash
        })
      })
        .then(response => response.text())
        .then(
          async data => {
            const db = await this.$store.dispatch('d2admin/db/database', {
              user: true
            })
            db.set('data', data).write()
            console.log(db.get('data').value())
          })
        .then(() => { this.$router.push('/locate/dappFLocateResult') })
        .catch(error => console.error('Error:', error))
    }
  }
}
</script>

<style>
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
