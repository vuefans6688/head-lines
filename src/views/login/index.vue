<template>
  <div class="login-container">
    <!-- 导航栏 -->
    <van-nav-bar
      class="app-nav-bar"
      title="注册 / 登录"
      left-arrow
      @click-left="$router.back()"
    />
    <!-- /导航栏 -->
    <!-- 登录表单 -->
    <!--
      基于Vant的表单验证:
      1.使用van-form组件包裹所有的表单项van-field
      2.给van-form绑定submit事件
        当表单提交的时候会触发submit事件
        提示: 只有表单验证通过，它才会调用submit
      3.使用Field的rules属性定义校验规则
     -->
    <van-form
      :show-error="false"
      :show-error-message="false"
      validate-first
      ref="login-form"
      @submit="onLogin"
      @failed="onFailed"
    >
      <van-field
        v-model="user.mobile"
        icon-prefix="toutiao"
        left-icon="shouji"
        center
        placeholder="请输入手机号"
        name="mobile"
        :rules="formRules.mobile"
      />
      <van-field
        v-model="user.code"
        clearable
        icon-prefix="toutiao"
        left-icon="yanzhengma"
        center
        placeholder="请输入验证码"
        name="code"
        :rules="formRules.code"
      >
        <template #button>
          <van-count-down
            v-if="isCountDown"
            :time="1000 * 60"
            format="ss s"
            @finish="isCountDown = false"
          />
          <van-button
            v-else
            class="send-button"
            size="mini"
            round
            :loading="isSendLoading"
            @click.prevent="sendShortLetter"
            >发送验证码</van-button
          >
        </template>
      </van-field>
      <div class="login-button-wrap">
        <van-button class="login-button" type="info" block>登录</van-button>
      </div>
    </van-form>
    <!-- /登录表单 -->
  </div>
</template>

<script>
import { login, sendSms } from '@/api/user'
export default {
  name: 'LoginIndex',
  data () {
    return {
      user: {
        mobile: '17090086870', // 手机号
        code: '246810' // 验证码
      },
      formRules: {
        mobile: [
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3|5|7|8|9]\d{9}$/, message: '手机号格式错误' }
        ],
        code: [
          { required: true, message: '请输入验证码' },
          { pattern: /^\d{6}$/, message: '验证码格式错误' }
        ]
      },
      isCountDown: false, // 控制倒计时和发送按钮的显示状态
      isSendLoading: false // 发送验证码按钮的loading状态
    }
  },
  methods: {
    async onLogin () {
      this.$toast.loading({
        message: '登录中...', // 提示文本
        forbidClick: true, // 禁止背景点击
        duration: 0 // 展示时长(ms)，值为0时，toast不会消失
      })
      try {
        const { data } = await login(this.user)
        // 4.处理响应结果
        this.$toast.success('登录成功')
        // 将后端返回的用户登录状态（token等数据）放到Vuex容器中
        this.$store.commit('SET_USER', data.data)
        // 登录成功，跳转回原来页面
        this.$router.push(this.$route.query.redirect || '/')
      } catch (err) {
        console.log(err)
        this.$toast.fail('登录失败，手机号或验证码错误')
      }
    },
    onFailed (error) {
      if (error.errors[0]) {
        this.$toast({
          message: error.errors[0].message, // 提示消息
          position: 'top' // 防止手机键盘太高看不见提示消息
        })
      }
    },
    async sendShortLetter () {
      try {
        // 校验手机号码
        await this.$refs['login-form'].validate('mobile')
        // 验证通过，请求发送验证码
        this.isSendLoading = true // 展示按钮的loading状态，防止网络慢用户多次点击触发发送行为
        await sendSms(this.user.mobile)
        // 短信发出去了，隐藏发送按钮，显示倒计时
        this.isCountDown = true
        // 倒计时结束 -> 隐藏倒计时，显示发送按钮（监视倒计时的finish事件处理）
      } catch (err) {
        // try 里面任何代码的错误都会进入 catch
        // 不同的错误需要有不同的提示，那就需要判断了
        let message = ''
        if (err && err.response && err.response.status === 429) {
          // 发送短信失败的错误提示
          message = '发送太频繁了，请稍后重试'
        } else if (err.name === 'mobile') {
          // 表单验证失败的错误提示
          message = err.message
        } else {
          // 未知错误
          message = '发送失败，请稍后重试'
        }
        // 提示用户
        this.$toast({
          message,
          position: 'top'
        })
      }
      // 无论发送验证码成功还是失败，最后都要关闭发送按钮的loading状态
      this.isSendLoading = false
    }
  }
}
</script>

<style scoped lang="less">
.login-container {
  .send-button {
    width: 76px;
    height: 23px;
    background-color: #ededed;
    .van-button__text {
      font-size: 11px;
      color: #666666;
    }
  }
  .login-button-wrap {
    padding: 26px 16px;
    .login-button {
      background-color: #6db4fb;
      border: none;
      .van-button__text {
        font-size: 15px;
      }
    }
  }
}
</style>
