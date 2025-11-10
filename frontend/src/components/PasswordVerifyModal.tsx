import React, { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

interface PasswordVerifyModalProps {
  visible: boolean
  ownerUsername: string
  onVerify: (username: string, password: string) => Promise<boolean>
  onCancel: () => void
}

const PasswordVerifyModal: React.FC<PasswordVerifyModalProps> = ({
  visible,
  ownerUsername,
  onVerify,
  onCancel
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const success = await onVerify(values.username, values.password)
      
      if (success) {
        message.success('Verification successful')
        form.resetFields()
      } else {
        message.error('Incorrect username or password')
      }
    } catch (error) {
      console.error('Verification failed:', error)
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
      title="File Access Verification"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Verify"
      cancelText="Cancel"
      maskClosable={false}
    >
      <div style={{ marginBottom: 16 }}>
        <p>This file belongs to user: <strong>{ownerUsername}</strong></p>
        <p style={{ color: '#ff4d4f' }}>Please enter the user's account password to access this file</p>
      </div>
      
      <Form form={form} layout="vertical">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please enter username' }]}
          initialValue={ownerUsername}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
            disabled
          />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Please enter the user's password"
            autoFocus
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PasswordVerifyModal
