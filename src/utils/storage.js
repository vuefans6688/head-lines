/**
 * 本地存储封装模块
 */
export const getItem = key => {
  const data = localStorage.getItem(key)
  // 为什么把JSON.parse放到try-catch中？因为data可能不是JSON格式字符串
  try {
    // 尝试把data转为JavaScript对象
    return JSON.parse(data)
  } catch (error) {
    // data不是JSON格式字符串，直接原样返回
    return data
  }
}

export const setItem = (key, value) => {
  // 如果value是对象，就把value转为JSON格式字符串再存储
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  localStorage.setItem(key, value)
}

export const removeItem = key => {
  localStorage.removeItem(key)
}
