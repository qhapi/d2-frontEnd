<template>
    <div class="contract-repair">
      <!-- 修复过程步骤条 -->
      <el-steps :active="4" align-center class="process-steps">
        <el-step title="代码解析" description="解构智能合约代码"></el-step>
        <el-step title="漏洞检测" description="检测合约漏洞"></el-step>
        <el-step title="修复生成" description="生成修复方案"></el-step>
        <el-step title="结果验证" description="验证修复效果"></el-step>
      </el-steps>
  
      <!-- 结果展示区 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="漏洞报告" name="bugReport">
          <el-table :data="mockBugs" style="width: 100%">
            <el-table-column prop="type" label="漏洞类型" />
            <el-table-column prop="pc" label="位置" />
            <el-table-column prop="tool" label="检测工具" />
            <el-table-column prop="code_coverage" label="代码覆盖率">
              <template slot-scope="scope">
                {{ scope.row.code_coverage }}%
              </template>
            </el-table-column>
            <el-table-column prop="description" label="漏洞描述" />
          </el-table>
        </el-tab-pane>
  
        <el-tab-pane label="控制流程图" name="cfg">
          <el-tabs type="border-card">
            <el-tab-pane label="构造函数 CFG">
              <div class="cfg-container">
                <div class="cfg-item">
                  <h3>原始构造函数 CFG</h3>
                  <iframe :src="'/example/constructor.original.pdf'" width="100%" height="500px" frameborder="0"></iframe>
                </div>
                <div class="cfg-item">
                  <h3>修复后构造函数 CFG</h3>
                  <iframe :src="'/example/constructor.patched.pdf'" width="100%" height="500px" frameborder="0"></iframe>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="运行时 CFG">
              <div class="cfg-container">
                <div class="cfg-item">
                  <h3>原始运行时 CFG</h3>
                  <iframe :src="'/example/original.pdf'" width="100%" height="500px" frameborder="0"></iframe>
                </div>
                <div class="cfg-item">
                  <h3>修复后运行时 CFG</h3>
                  <iframe :src="'/example/patched.pdf'" width="100%" height="500px" frameborder="0"></iframe>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
  
        <el-tab-pane label="修复报告" name="repairReport">
          <el-descriptions title="修复详情" :column="1" border>
            <el-descriptions-item label="修复时间">
              {{ mockReport.execution_time.toFixed(2) }}s
            </el-descriptions-item>
            <el-descriptions-item label="控制流图恢复率">
              {{ mockReport.control_flow_graph_recovery }}
            </el-descriptions-item>
            <el-descriptions-item label="原始部署大小">
              {{ mockReport.original_deployment_size }}
            </el-descriptions-item>
            <el-descriptions-item label="修复后部署大小">
              {{ mockReport.patched_deployment_size }}
            </el-descriptions-item>
          </el-descriptions>
  
          <h3>修复补丁</h3>
          <el-collapse>
            <el-collapse-item
              v-for="(patch, index) in mockReport.patches"
              :key="patch.bug_type + patch.pc"
              :title="`漏洞 ${index + 1}: ${patch.bug_type}`"
            >
              <div v-for="(p, i) in patch.patch" :key="i">
                <p><strong>插入模式:</strong> {{ p.insert_mode }}</p>
                <p><strong>插入代码:</strong> {{ p.insert }}</p>
              </div>
            </el-collapse-item>
          </el-collapse>
  
          <h3>修复前后对比</h3>
          <div class="comparison-chart">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card>
                  <div slot="header">原始合约</div>
                  <div>漏洞数量: 2</div>
                  <div>部署大小: {{ mockReport.original_deployment_size }}</div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <div slot="header">修复后合约</div>
                  <div>漏洞数量: 0</div>
                  <div>部署大小: {{ mockReport.patched_deployment_size }}</div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script>
    export default {
    data() {
        return {
        activeTab: 'bugReport',
        mockBugs: [
            {
            "code_coverage": 98.3,
            "execution_time": 1.71,
            "tool": "Oyente",
            "pc": 352,
            "type": "reentrancy",
            "description": "重入漏洞：合约在外部调用前未更新状态，导致攻击者可以重复调用函数。"
            }
        ],
        mockReport: {
            "patches": [
            {
                "bug_type": "reentrancy",
                "pc": 312,
                "patch": [
                {
                    "delete": "",
                    "insert": "PUSH1_0x1 SLOAD PUSH1_0x1 EQ ISZERO PUSH_jump_loc_1 JUMPI PUSH1_0x0 DUP1 REVERT JUMPDEST_jump_loc_1 PUSH1_0x1 PUSH1_0x1 SSTORE",
                    "insert_mode": "before",
                    "constructor": false
                },
                {
                    "delete": "",
                    "insert": "PUSH1_0x0 PUSH1_0x1 SSTORE",
                    "insert_mode": "after",
                    "constructor": false
                }
                ]
            },
            {
                "bug_type": "reentrancy",
                "pc": 352,
                "patch": [
                {
                    "delete": "",
                    "insert": "PUSH1_0x1 SLOAD PUSH1_0x1 EQ ISZERO PUSH_jump_loc_1 JUMPI PUSH1_0x0 DUP1 REVERT JUMPDEST_jump_loc_1 PUSH1_0x1 PUSH1_0x1 SSTORE",
                    "insert_mode": "before",
                    "constructor": false
                },
                {
                    "delete": "",
                    "insert": "PUSH1_0x0 PUSH1_0x1 SSTORE",
                    "insert_mode": "after",
                    "constructor": false
                }
                ]
            }
            ],
            "control_flow_graph_recovery_time": 0.0093,
            "control_flow_graph_recovery": "100%",
            "original_deployment_size": "32 bytes",
            "patched_deployment_size": "32 bytes",
            "original_runtime_size": "452 bytes",
            "patched_runtime_size": "504 bytes",
            "execution_time": 0.2308
        }
        };
    },
    mounted() {
        // 确保数据已经加载
        console.log('mockBugs:', this.mockBugs);
        console.log('mockReport:', this.mockReport);
    }
    };
  </script>
  
  <style scoped>
  .contract-repair {
    padding: 20px;
  }
  .process-steps {
    margin-bottom: 30px;
  }
  .cfg-container {
    display: flex;
    gap: 20px;
  }
  .cfg-item {
    flex: 1;
  }
  .comparison-chart {
    margin-top: 20px;
  }
  @media (max-width: 768px) {
    .cfg-container {
      flex-direction: column;
    }
  }
  </style>