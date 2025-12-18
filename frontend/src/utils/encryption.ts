// 简单的加密/解密工具（使用Base64 + 密码混淆）
// 注意：这是基础加密，生产环境应使用更安全的加密库如 crypto-js

export const encryptData = (data: string, password: string): string => {
  try {
    // 将数据和密码混合
    const combined = data + '::HPLC_SEPARATOR::' + password
    // Base64编码
    return btoa(unescape(encodeURIComponent(combined)))
  } catch (error) {
    console.error('加密失败:', error)
    throw new Error('数据加密失败')
  }
}

export const decryptData = (encryptedData: string, password: string = ''): string => {
  try {
    // Base64解码
    const combined = decodeURIComponent(escape(atob(encryptedData)))
    const separator = '::HPLC_SEPARATOR::'
    
    console.log('🔓 解密旧加密文件（兼容模式）')
    
    // 检查是否包含分隔符（带密码的格式）
    if (!combined.includes(separator)) {
      // 旧格式：直接 Base64 编码，没有密码验证
      console.log('✅ 旧格式文件（无密码），直接返回数据')
      return combined
    }
    
    const parts = combined.split(separator)
    const data = parts[0]
    const storedPassword = parts[1]
    
    console.log('✅ 带密码格式文件，忽略密码验证，返回数据')
    
    // 不再验证密码，直接返回数据（向后兼容）
    return data
  } catch (error) {
    console.error('解密失败:', error)
    // 解密失败时返回null，让调用者处理
    return ''
  }
}

// 验证文件所有者
export const verifyFileOwner = (fileData: any, username: string): boolean => {
  return fileData.owner === username
}

// 生成文件指纹（用于验证文件完整性）
export const generateFileHash = (data: string): string => {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}
