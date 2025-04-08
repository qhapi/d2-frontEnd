<template>
  <d2-container>
    <el-container>
      <el-aside width="450px" style="max-height: 84vh">
        <el-menu unique-opened @open="showCode" ref="menu">
          <el-submenu
            v-for="(contract, i) in contracts"
            :key="i"
            :index="`${i}`"
            @click="showCode(contract)"
          >
            <template #title>
              <span style="float:left; font-weight:bold; font-size:14px; color:#2C8DF4;">
                {{ contract.name }} (文件置信度: {{ averageConfidence(contract.name).toFixed(2) }})
              </span>
            </template>
            <el-menu-item
              v-for="(fault, j) in getFaults(contract.name)"
              :key="j"
              @click="handleMenuItemClicked(fault)"
            >
              {{ `${fault.check}:${fault.lines[0]}-${fault.lines[fault.lines.length - 1]}` }}
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
          <el-divider />
          <el-row>
            {{ description }}
          </el-row>
        </el-card>
        <div>
          <d2-highlight :code="code" :redLines="redLines" :confidenceData="confidenceData"></d2-highlight>
        </div>
      </el-main>
      <el-dialog
        title="DappSCAN"
        :visible.sync="dappScanVisible"
        :before-close="handleClose"
        width="60%"
      >
        <transaction-upload />
      </el-dialog>
    </el-container>
  </d2-container>
</template>

<script>
import TransactionUpload from '@/views/system/locate/transactionUpload/index.vue';
import D2Highlight from '@/components/d2-highlight/index.vue';

export default {
  name: 'confidenceResult',
  components: { TransactionUpload, D2Highlight }, // 注册组件

  data() {
    return {
      dappScanVisible: false,
      description: '',
      redLines: [], // 初始化为空数组
      contracts: [
        { name: 'ContractA', faults: [] },
        { name: 'ContractB', faults: [] }
      ],
      jsonData: {
        ContractA: [
          { check: '检查1', lines: [1, 2], description: '描述1' },
          { check: '检查2', lines: [3], description: '描述2' }
        ],
        ContractB: [
          { check: '检查3', lines: [4, 5], description: '描述3' }
        ]
      },
      code: ``,
      confidenceData: [3.85, 2.92, 2.78, 1.80, 2.83], // 模拟的置信度数据
    };
  },
  methods: {
    handleClose() {
      this.dappScanVisible = false;
    },
    averageConfidence(contractName) {
      const faults = this.jsonData[contractName] || [];
      const totalConfidence = faults.reduce((sum, fault) => {
        const lines = fault.lines.length;
        return sum + (lines > 0 ? this.confidenceData.slice(0, lines).reduce((a, b) => a + b, 0) / lines : 0);
      }, 0);
      return totalConfidence / faults.length || 0;
    },
    showCode(contract) {
      this.code = `function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        return true;
      }`;
    },
    getFaults(contractName) {
      return this.jsonData[contractName] || [];
    },
    handleMenuItemClicked(fault) {
      this.redLines = fault.lines;
      this.description = fault.description;
    }
  }
};
</script>

<style>
body, html, #app {
  height: 100%;
  margin: 0;
}

.code-container {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
}

.code-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

.line-content {
  white-space: pre;
  flex-grow: 1;
}

/* 置信度右对齐 */
.confidence {
  margin-left: 10px;
  color: #888;
  text-align: right;
  min-width: 50px;
}
</style>
