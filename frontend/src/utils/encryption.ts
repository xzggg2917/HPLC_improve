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

export const decryptData = (encryptedData: string, password: string): string => {
  try {
    // Base64解码
    const combined = decodeURIComponent(escape(atob(encryptedData)))
    const separator = '::HPLC_SEPARATOR::'
    
    console.log('🔍 Decryption debug:')
    console.log('  - Input password:', password)
    console.log('  - Input password length:', password.length)
    console.log('  - Combined data length:', combined.length)
    console.log('  - Has separator:', combined.includes(separator))
    
    // 检查是否包含分隔符（新格式）
    if (!combined.includes(separator)) {
      // 旧格式：直接 Base64 编码，没有密码验证
      console.log('⚠️ 检测到旧格式文件（无密码保护），直接返回数据')
      return combined
    }
    
    const parts = combined.split(separator)
    const data = parts[0]
    const storedPassword = parts[1]
    
    console.log('  - Stored password:', storedPassword)
    console.log('  - Stored password length:', storedPassword.length)
    console.log('  - Passwords match:', storedPassword === password)
    
    // 验证密码
    if (storedPassword !== password) {
      throw new Error('密码错误')
    }
    
    return data
  } catch (error) {
    if (error instanceof Error && error.message === '密码错误') {
      throw error
    }
    console.error('解密失败:', error)
    throw new Error('数据解密失败或密码错误')
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
