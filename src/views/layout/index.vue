<template>
  <div class="layout-container">
    <!-- layout 的子路由出口，或者说是二级路由 -->
    <keep-alive>
      <router-view />
    </keep-alive>
    <!-- /子路由出口 -->
    <!-- 底部导航栏 -->
    <van-tabbar v-model="active" route>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="comment-o" to="/qa">问答</van-tabbar-item>
      <van-tabbar-item icon="video-o" to="/video">视频</van-tabbar-item>
      <van-tabbar-item icon="manager-o" to="/my">我的</van-tabbar-item>
    </van-tabbar>
    <!-- /底部导航栏 -->
  </div>
</template>

<script>
export default {
  name: 'LayoutIndex',
  data () {
    return {
      active: 0
    }
  },
  mounted () {
    this.$store.commit('ADD_CACHE_PAGE', 'LayoutIndex')
  }
}
</script>

<style scoped lang="less"></style>
