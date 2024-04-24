<template>
  <d2-container class="page">
      <div class="cover-content">
        <!-- 区块链元素图片 -->
        <img src="@/assets/image/blockchain-image.jpg" alt="区块链元素图片" class="blockchain-image">
        <h1 class="cover-title">多功能区块链漏洞检测修复平台</h1>
        <p class="cover-description">欢迎使用我们的平台，致力于解决区块链系统中的安全隐患。</p>
        <!-- 点击按钮跳转到 contractUpload 页面 -->
        <el-button type="primary" @click="startClicked" class="cover-button">开始使用</el-button>
      </div>
      <template slot="footer">
        <div class="btn-group">
          <span class="btn-group__btn">面向多层次的区块链漏洞挖掘技术研究</span>
        </div>
      </template>
  </d2-container>
</template>

<script>
export default {
  methods: {
    startClicked () {
      // 跳转到 contractUpload 页面
      this.$router.push({ name: 'contractUpload' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  // 设置背景图片
  background-image: url('../../../assets/image/background.jpg');
  background-size: cover; // 背景图片尺寸适应容器大小
  background-position: center; // 背景图片居中对齐
  background-repeat: no-repeat; // 不重复平铺背景图片

  .cover-content {
    text-align: center;
    padding: 40px;
  }
  .blockchain-image {
    max-width: 50%; /* 设置图片最大宽度为父元素宽度的一半 */
    height: auto; /* 根据宽度自动调整高度 */
    margin-bottom: 20px;
  }
  .cover-title {
    font-size: 36px;
    color: #333;
    margin-bottom: 20px;
  }
  .cover-description {
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
  }
  .cover-button {
    font-size: 18px;
  }
  .btn-group {
    color: #666;
    font-size: 12px;
    line-height: 12px;
    margin-top: 20px;
    .btn-group__btn {
      color: #666;
      &:hover {
        color: #409EFF;
      }
    }
  }
}
</style>
