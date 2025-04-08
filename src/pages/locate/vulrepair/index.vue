<template>
  <d2-container class="page-container">
    <!-- 步骤导航 -->
    <el-steps :active="activeStep" finish-status="success" simple>
      <el-step title="合约输入"></el-step>
      <el-step title="漏洞定位"></el-step>
      <el-step title="修复方案"></el-step>
      <el-step title="修复完成"></el-step>
    </el-steps>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1：合约输入 -->
      <div v-if="activeStep === 0" class="contract-input">
        <el-card class="input-card">
          <h3 class="step-title">请输入智能合约地址</h3>
          <el-input 
            v-model="contractAddress"
            placeholder="0x..."
            class="address-input"
            clearable>
            <template slot="prepend">合约地址</template>
          </el-input>
          <el-button 
            type="primary" 
            @click="handleAnalyze"
            class="analyze-btn"
            :disabled="!contractAddressValid">
            开始分析
          </el-button>
        </el-card>
      </div>

      <!-- 步骤2：漏洞定位 -->
      <div v-if="activeStep === 1" class="vulnerability-locate">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="vul-info">
              <div slot="header" class="vul-header">
                <i class="el-icon-warning"></i>
                <span>检测到高危漏洞</span>
              </div>
              <div class="vul-detail">
                <el-tag type="danger">Reentrancy Attack</el-tag>
                <div class="detail-item">
                  <label>危险等级：</label>
                  <span class="danger-level critical">严重</span>
                </div>
                <div class="detail-item">
                  <label>触发交易：</label>
                  <span class="tx-hash">0x3d7...c9a2</span>
                </div>
                <div class="code-snippet">
                  <pre><code class="hljs solidity">function withdraw() public {
    // 🚨 危险：先转账后修改状态
    (bool success, ) = msg.sender.call{value: balance}("");
    require(success);
    balances[msg.sender] = 0;
}</code></pre>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="transaction-list">
              <div slot="header">历史触发交易</div>
              <el-timeline>
                <el-timeline-item
                  v-for="(tx, index) in transactions"
                  :key="index"
                  :timestamp="tx.timestamp">
                  {{ tx.description }}
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
        </el-row>
        <el-button type="primary" @click="activeStep++">进入修复</el-button>
      </div>

      <!-- 步骤3：修复方案 -->
      <div v-if="activeStep === 2" class="code-repair">
        <el-tabs type="border-card">
          <el-tab-pane label="代码对比">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="code-panel vulnerable">
                  <div class="code-title">修复前（有漏洞）</div>
                  <pre><code class="hljs solidity">{{ vulnerableCode }}</code></pre>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="code-panel fixed">
                  <div class="code-title">修复后（已修复）</div>
                  <pre><code class="hljs solidity">{{ fixedCode }}</code></pre>
                </div>
              </el-col>
            </el-row>
            <div class="code-legend">
              <el-tag type="danger">删除/问题代码</el-tag>
              <el-tag type="success">新增/修复代码</el-tag>
            </div>
          </el-tab-pane>
          <el-tab-pane label="修复说明">
            <div class="explanation">
              <h4>修复要点说明：</h4>
              <ul>
                <li><el-tag type="success">新增</el-tag> 重入锁机制</li>
                <li><el-tag type="warning">修改</el-tag> 状态修改顺序</li>
                <li><el-tag>优化</el-tag> 错误处理逻辑</li>
              </ul>
              <el-divider></el-divider>
              <h4>安全建议：</h4>
              <el-alert
                title="使用 OpenZeppelin 的 ReentrancyGuard"
                type="info"
                :closable="false"
                description="建议引入行业标准库来增强合约安全性">
              </el-alert>
            </div>
          </el-tab-pane>
        </el-tabs>
        <el-button type="success" @click="activeStep++">确认修复</el-button>
      </div>

      <!-- 步骤4：修复完成 -->
      <div v-if="activeStep === 3" class="repair-complete">
        <el-result
          icon="success"
          title="修复成功！"
          sub-title="合约已通过安全验证">
          <template slot="extra">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="code-card">
                  <div slot="header" class="card-title danger-title">
                    <i class="el-icon-circle-close"></i>
                    修复前
                  </div>
                  <div class="code-block danger">
                    <pre><code class="hljs solidity">{{ vulnerableHighlight }}</code></pre>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card class="code-card">
                  <div slot="header" class="card-title success-title">
                    <i class="el-icon-circle-check"></i>
                    修复后
                  </div>
                  <div class="code-block success">
                    <pre><code class="hljs solidity">{{ fixedHighlight }}</code></pre>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <div class="action-buttons">
              <el-button type="primary" @click="activeStep=0">重新检测</el-button>
              <el-button @click="$router.push('/locate/vuldatabase')">查看漏洞库</el-button>
            </div>
          </template>
        </el-result>
      </div>
    </div>
  </d2-container>
</template>

<script>
export default {
  data() {
    return {
      activeStep: 0,
      contractAddress: '',
      transactions: [
        { timestamp: '2023-08-15 14:32', description: '异常转账 1.2 ETH' },
        { timestamp: '2023-08-14 09:15', description: '可疑合约调用' }
      ],
      vulnerableCode: `pragma solidity ^0.8.0;

contract Vulnerable {
    mapping(address => uint) public balances;
    
    function withdraw() public {
        // 🚨 危险：先转账后修改状态
        (bool success, ) = msg.sender.call{value: balances[msg.sender]}("");
        require(success);
        balances[msg.sender] = 0;
    }
}`,
      fixedCode: `pragma solidity ^0.8.0;

contract Fixed {
    mapping(address => uint) public balances;
    bool private locked; // ✅ 新增重入锁
    
    function withdraw() public {
        require(!locked, "Reentrancy guard");
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;  // ✅ 先修改状态
        locked = true;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        locked = false;
    }
}`,
      vulnerableHighlight: `function withdraw() public {
    // 🚨 危险代码
    (bool success, ) = msg.sender.call{value: balances[msg.sender]}("");
    require(success);
    balances[msg.sender] = 0; // 错误顺序
}`,
      fixedHighlight: `function withdraw() public {
    require(!locked, "Reentrancy guard");
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0; // ✅ 正确顺序
    locked = true;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    locked = false;
}`
    }
  },
  computed: {
    contractAddressValid() {
      return this.contractAddress.length === 42 && this.contractAddress.startsWith('0x')
    }
  },
  methods: {
    handleAnalyze() {
      // 模拟分析过程
      setTimeout(() => {
        this.activeStep = 1
      }, 800)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  .step-content {
    margin-top: 30px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(237, 224, 224, 0.1);
  }

  .contract-input {
    max-width: 600px;
    margin: 50px auto;
    
    .address-input {
      margin: 30px 0;
    }
    
    .analyze-btn {
      width: 100%;
      margin-top: 20px;
    }
  }

  .vulnerability-locate {
    .vul-header {
      color: #F56C6C;
      font-weight: bold;
      
      i {
        margin-right: 8px;
      }
    }

    .vul-detail {
      .detail-item {
        margin: 15px 0;
        
        label {
          color: #909399;
        }
        
        .danger-level {
          &.critical {
            color: #F56C6C;
            font-weight: bold;
          }
        }
      }

      pre {
        background: #ffffff !important;  // 改为白色背景
        border: 1px solid #e0e0e0;        // 添加浅灰色边框
        color: #333 !important;           // 改为深色文字
        padding: 15px !important;
        border-radius: 4px;
      }
    }
  }

  .code-repair {
    .code-panel {
      border: 2px solid;
      border-radius: 6px;
      margin-bottom: 20px;
      transition: transform 0.3s;
      
      &:hover {
        transform: translateY(-3px);
      }

      .code-title {
        padding: 12px;
        font-weight: bold;
        font-size: 16px;
      }

      pre {
        padding: 15px;
        margin: 0;
        max-height: 500px;
        overflow-y: auto;
      }

      &.vulnerable {
        border-color: #ffeded;
        background: #fff5f5;
        
        .code-title {
          background: #fff5f5;
          color: #f56c6c;
        }
      }

      &.fixed {
        border-color: #f0f9eb;
        background: #f8fff0;
        
        .code-title {
          background: #f0f9eb;
          color: #67c23a;
        }
      }
    }

    .code-legend {
      margin: 20px 0;
      text-align: center;
      
      .el-tag {
        margin: 0 10px;
        font-size: 14px;
      }
    }
  }

  .repair-complete {
    .code-card {
      margin-bottom: 20px;
      
      .card-title {
        font-weight: bold;
        font-size: 16px;
        
        i {
          margin-right: 8px;
        }
        
        &.danger-title {
          color: #f56c6c;
        }
        
        &.success-title {
          color: #67c23a;
        }
      }

      .code-block {
        pre {
          padding: 15px;
          border-radius: 4px;
        }

        &.danger {
          border-left: 3px solid #f56c6c;
          background: #fff5f5;
        }

        &.success {
          border-left: 3px solid #67c23a;
          background: #f0f9eb;
        }
      }
    }

    .action-buttons {
      margin-top: 30px;
      text-align: center;
    }
  }
}

// 高亮样式
.hljs {
  background:rgb(255, 255, 255);
  padding: 1em !important;
  border-radius: 4px;
  
  .hljs-comment {
    color: #999;
  }
  
  .hljs-keyword {
    color:rgb(245, 235, 244);
  }
  
  .hljs-built_in {
    color: #569cd6;
  }
  
  .hljs-string {
    color:rgb(251, 249, 248);
  }
  
  .hljs-number {
    color: #b5cea8;
  }
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 20px;
  }
}
</style>