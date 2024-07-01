<template>
  <d2-container>
    <el-row gutter="20">
      <el-col :span="11">
        <h1>原始合约</h1>
        <d2-highlight :code="inputText" ></d2-highlight>
      </el-col>
      <el-col :span="11">
        <h1>修改后合约</h1>
        <d2-highlight :code="outputText" ></d2-highlight>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <el-row>
        <template>
          <el-radio @change="chooseMethod('1')" v-model="radio" label="1">方案一</el-radio>
          <el-radio @change="chooseMethod('2')" v-model="radio" label="2">方案二</el-radio>
          <el-button>导出修改</el-button>
        </template>
    </el-row>
  </d2-container>
</template>

<script>

export default {
  name: 'locateOne',
  data () {
    return {
      radio: '1',
      inputText: 'contract Storage {\n' +
        '    uint256 number;\n' +
        '\n' +
        '    function store(uint256 num) public {\n' +
        '        number = num;\n' +
        '    }\n' +
        '\n' +
        '    function retrieve() public view returns (uint256){\n' +
        '        return number;\n' +
        '    }\n' +
        '}',
      outputText: 'text1',
      form: {
        name: '',
        init: 'randomized',
        desc: '',
        fileList: []
      }
    }
  },
  methods: {
    chooseMethod (label) {
      const axios = require('axios');
      const params = {
        module: 'contract',
        action: 'getsourcecode',
        address: '0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50',
        apikey: 'NYJZTBJJJW4SNVY2IPNMIFNNUNVCEYYQZC'
      };
      const client = axios.create({
        baseURL: 'https://api.etherscan.io/api',
        timeout: 10000
      });
      client.get('', { params })
        .then(response => {
          const jsonString = response.data.result[0].SourceCode.slice(1, -1).trim()
          const jsonObject = JSON.parse(jsonString)
          console.log(jsonObject)
        })
        .catch(error => {
          console.error('API Request Failed:', error)
        });
      switch (label) {
        case '1':
          this.outputText = 'text1'
          break
        case '2':
          this.outputText = 'text2'
          break
        default:
          break
      }
    }
  }
}
</script>
