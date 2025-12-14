import React, { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { StorageHelper } from '../utils/storage'

interface PasswordConfirmModalProps {
  visible: boolean
  username: string
  onConfirm: (password: string) => void
  onCancel: () => void
}

/**
 * 密码确认对话框
 * 用于在保存加密文件前确认用户密码
 */
const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({
  visible,
  username,
  onConfirm,
  onCancel
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleOk = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      // Verify password is correct
      const users = await StorageHelper.getUsers()
      if (!users || users.length === 0) {
        message.error('User data does not exist')
        return
      }
      const user = users.find((u: any) => u.username === username && u.password === values.password)

      if (!user) {
        message.error('Incorrect password, please try again')
        form.setFields([
          {
            name: 'password',
            errors: ['Incorrect password']
          }
        ])
        return
      }

      // Password correct, return password
      form.resetFields()
      onConfirm(values.password)
    } catch (error) {
      console.error('Password verification failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="Confirm Password to Save File"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Confirm Save"
      cancelText="Cancel"
      closable={true}
      maskClosable={false}
      centered
    >
      <p>To protect your data security, the file will be encrypted and saved with a password.</p>
      <p style={{ color: '#ff4d4f', fontWeight: 500 }}>⚠️ If this is a misclick, please click the ✕ button or Cancel button</p>
      <p>Current user: <strong>{username}</strong></p>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Please enter your password"
          name="password"
          rules={[
            { required: true, message: 'Please enter password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password placeholder="Enter password to encrypt file" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PasswordConfirmModal
