import { userState } from '@/store/data';
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/router';
import md5 from 'md5';
import dayjs from 'dayjs';
import { apiClient } from '@/utils/apiClient';
import { signIn } from 'next-auth/react';
import { decode, hashPassword, generateSalt } from '@/utils/encryption';

const ChangePassword = () => {
    const router = useRouter();
    const [user,setUser] = useRecoilState(userState);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        if (values?.username && values?.newpassword == values?.confirmpassword) {
            console.log(values)
            // check duplicate old password
            let old = await apiClient().post('/user/find', {username: values.username})
            console.log('old',old?.data[0])
            if (!_.isNull(old?.data[0]?.salt) && old?.data[0]?.password == hashPassword(values.newpassword, old?.data[0]?.salt)) {
                message.error('The new password you entered is the same as old password. Please enter a different password.');
            } else {
              let newSalt = generateSalt();
              console.log('newSalt', newSalt)
                let data = {
                    username: values.username,
                    password: hashPassword(values.newpassword, newSalt),
                    salt: newSalt,
                    date_changepassword: dayjs().format('YYYY-MM-DD')
                }
                let result = await apiClient().put('/user/update', data);
                if (result.status==200 && result?.data[0]?.changedRows==1) {
                    router.push('/auth/login')
                } else {
                    message.error('Cannot update password, please contact admin')
                }
            }
        } else {
            router.push('/auth/login?error=not_found_username')
        }
    }
    
    
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 90px)' }}>
          <Form name="login" initialValues={{username: user}} onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="New Password"
              name="newpassword"
              rules={[
                { required: true, message: 'Please enter your new password' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
                  message: 'Password pattern Uppercase+Lowercase+SpacialCharator+Number'
                }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmpassword"
              rules={[
                { required: true, message: 'Please enter your confirm password' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
                  message: 'Password pattern Uppercase+Lowercase+SpacialCharator+Number'
                },
                ({getFieldValue}) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('newpassword') === value) {
                            return Promise.resolve();
                        } 
                        return Promise.reject(new Error('Password not match'));
                    }
                })
                ]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Log in
              </Button>
            </Form.Item>
          </Form>
        </div>
  );
}

export default ChangePassword