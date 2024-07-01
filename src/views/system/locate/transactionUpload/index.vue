<template>
  <d2-container>
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
      <el-col offset="16">
        <el-button icon="el-icon-plus" @click="addFaultlessInput">增加正确交易地址</el-button>
        <el-button icon="el-icon-plus" @click="addFaultInput">增加故障交易地址</el-button>
        <el-button @click="buttonClicked">开始定位</el-button>
      </el-col>
    </el-row>
  </d2-container>
</template>


<script>


export default {
  name: 'transactionUpload',

  data () {
    return {
      faultless_txhashs: [
        { placeholder: '请输入正常交易地址', model: '' }
      ],
      fault_txhashs: [
        { placeholder: '请输入故障交易地址', model: '' }
      ]
    }
  },

  methods: {
    addFaultlessInput() {
      this.faultless_txhashs.push({ placeholder: '请输入正常交易地址', model: '' });
    },
    addFaultInput() {
      this.fault_txhashs.push({ placeholder: '请输入故障交易地址', model: '' });
    },
    buttonClicked() {
      this.$router.push('locateResult')
    }
  }
}
</script>
