<template>
  <d2-container>
    <el-row :gutter="20">
      <!-- 代码输入区 -->
      <el-col :span="16">
        <monaco-editor v-model="contractCode" language="solidity"/>
        <el-button @click="handleCheck">开始检测</el-button>
      </el-col>
      
      <!-- 结果展示区 -->
      <el-col :span="8">
        <el-card v-if="result">
          <h3>检测结果：{{ result.status }}</h3>
          <pre>{{ result.details }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </d2-container>
</template>