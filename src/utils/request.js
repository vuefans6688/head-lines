import axios from 'axios'
import JSONbig from 'json-bigint'
import { Toast } from 'vant'
// 在非组件模块中获取store必须通过这种方式
// 这里单独加载store，和在组件中this.$store是同一个东西
import store from '@/store/'
import router from '@/router/'

const refreshTokenRequest = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn/'
})

const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn/', // 基础路径
  transformResponse: [data => {
    // 后端返回的数据可能不是JSON格式字符串
    // 如果不是的话，那么调用JSONbig.parse就会报错
    // 所以我们使用try、catch来捕获异常，处理异常的发生
    try {
      // 如果转换成功，则直接把结果返回
      return JSONbig.parse(data)
    } catch (err) {
      // 如果转换失败了，则进入这里
      // 我们在这里把数据原封不动的直接返回给请求使用
      return data
    }
    // axios默认在内部使用JSON.parse来转换处理原始数据
    // return JSON.parse(data)
  }]
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const { user } = store.state
    // 如果用户已登录，统一给接口设置token信息
    if (user) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    // 处理完之后一定要把config返回，否则请求就会停在这里
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 响应成功进入这里
    return response
  },
  async error => {
    // 请求响应失败进入这里
    // 超过2xx的状态码都会进入这里
    const status = error.response.status
    if (status === 400) {
      // 客户端请求参数错误
      Toast.fail('客户端请求参数异常')
      // token 无效
    } else if (status === 401) {
      // 如果没有user或者user.token，直接去登录
      const { user } = store.state
      if (!user || !user.token) {
        // 直接跳转到登录页
        return redirectLogin()
      }
      // 使用refresh_token请求获取新的token
      try {
        const { data } = await refreshTokenRequest({
          method: 'PUT',
          url: '/app/v1_0/authorizations',
          headers: {
            Authorization: `Bearer ${user.refresh_token}`
          }
        })
        // 拿到新的token之后把它更新到容器中
        user.token = data.data.token
        store.commit('SET_USER', user)
        // 把失败的请求重新发出去
        // error.config是本次请求的相关配置信息对象
        // 这里使用request发请求，它会走自己的拦截器
        // 它的请求拦截器中通过store容器访问token数据
        return request(error.config)
      } catch (err) {
        // refresh_token都失败了，直接跳转登录页
        redirectLogin()
      }
    } else if (status === 403) {
      // 没有权限操作
      Toast.fail('没有权限操作')
    } else if (status >= 500) {
      // 服务端异常
      Toast.fail('服务端异常，请稍后重试')
    }
    // 抛出异常
    return Promise.reject(error)
  }
)

function redirectLogin () {
  router.replace({
    name: 'login',
    // 传递查询参数，查询参数会以？作为分隔符放到url后面
    query: {
      // 数据名是自己起的
      // router.currentRoute和我们在组件中获取的this.$route是一个东西
      redirect: router.currentRoute.fullPath
    }
  })
}

export default request
