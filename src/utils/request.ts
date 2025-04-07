// import { useToast } from 'wot-design-uni'

interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
}

interface RequestOptions extends UniNamespace.RequestOptions {
  showLoading?: boolean
  showError?: boolean
}

// 接口基础URL
const BASE_URL = 'https://api.example.com'

// token的存储键名
const TOKEN_KEY = 'auth_token'

// 安全获取uni对象
function getSafeUni() {
  return typeof window !== 'undefined' && window.uni ? window.uni : uni;
}

/**
 * 获取存储的token
 */
export function getToken(): string {
  try {
    return getSafeUni().getStorageSync(TOKEN_KEY) || '';
  } catch (e) {
    console.error('获取token失败', e);
    return '';
  }
}

/**
 * 设置token到本地存储
 */
export function setToken(token: string) {
  if (!token) return;
  
  try {
    getSafeUni().setStorageSync(TOKEN_KEY, token);
  } catch (e) {
    console.error('保存token失败', e);
  }
}

/**
 * 清除token
 */
export function removeToken() {
  try {
    getSafeUni().removeStorageSync(TOKEN_KEY);
  } catch (e) {
    console.error('移除token失败', e);
  }
}

/**
 * 请求拦截器
 */
function requestInterceptor(config: RequestOptions) {
  // 添加token到请求头
  const token = getToken()
  if (token) {
    if (!config.header) {
      config.header = {}
    }
    config.header.Authorization = `Bearer ${token}`
  }

  // 添加基础URL
  if (config.url && !config.url.startsWith('http')) {
    config.url = `${BASE_URL}${config.url}`
  }

  // 显示加载提示
  if (config.showLoading !== false) {
    getSafeUni().showLoading({
      title: '加载中...',
      mask: true,
    })
  }

  return config
}

/**
 * 响应拦截器
 */
function responseInterceptor<T>(response: UniNamespace.RequestSuccessCallbackResult, options: RequestOptions): BaseResponse<T> {
  // 隐藏加载提示
  if (options.showLoading !== false) {
    getSafeUni().hideLoading()
  }

  const { statusCode, data } = response

  // 请求成功
  if (statusCode >= 200 && statusCode < 300) {
    return data as BaseResponse<T>
  }

  // 处理特定错误码
  if (statusCode === 401) {
    // 清除token并跳转到登录页
    removeToken()

    // 显示友好提示
    getSafeUni().showToast({
      title: '登录已过期，请重新登录',
      icon: 'none',
      duration: 2000,
    })

    // 延迟跳转，让用户看到提示
    setTimeout(() => {
      getSafeUni().reLaunch({ url: '/pages/login/index' })
    }, 1500)

    throw new Error('登录已过期，请重新登录')
  }

  // 显示错误提示
  if (options.showError !== false) {
    const errMsg = (data as BaseResponse<T>)?.message || '请求失败'
    getSafeUni().showToast({
      title: errMsg,
      icon: 'error',
    })
  }

  throw new Error((data as BaseResponse<T>)?.message || '请求失败')
}

/**
 * 错误处理
 */
function errorHandler(error: any, options: RequestOptions) {
  // 隐藏加载提示
  if (options.showLoading !== false) {
    getSafeUni().hideLoading()
  }

  // 显示错误提示
  if (options.showError !== false) {
    const errMsg = error.errMsg || error.message || '请求异常'
    getSafeUni().showToast({
      title: errMsg,
      icon: 'error',
    })
  }

  throw error
}

/**
 * 通用请求方法
 */
function request<T = any>(options: RequestOptions): Promise<BaseResponse<T>> {
  const interceptedOptions = requestInterceptor(options)

  return new Promise((resolve, reject) => {
    getSafeUni().request({
      ...interceptedOptions,
      success: (res) => {
        try {
          const data = responseInterceptor<T>(res, options)
          resolve(data)
        }
        catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        errorHandler(err, options)
        reject(err)
      },
    })
  })
}

/**
 * GET请求
 */
export function get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<BaseResponse<T>> {
  return request<T>({
    url,
    method: 'GET',
    data: params,
    ...options,
  })
}

/**
 * POST请求
 */
export function post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<BaseResponse<T>> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...options,
  })
}

/**
 * PUT请求
 */
export function put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<BaseResponse<T>> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...options,
  })
}

/**
 * DELETE请求
 */
export function del<T = any>(url: string, data?: any, options?: RequestOptions): Promise<BaseResponse<T>> {
  return request<T>({
    url,
    method: 'DELETE',
    data,
    ...options,
  })
}

export default {
  get,
  post,
  put,
  del,
  request,
  getToken,
  setToken,
  removeToken,
}
