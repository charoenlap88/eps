import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Form, Input, Button, message, Row, Col, Image } from 'antd';
import { apiClient } from '@/utils/apiClient';
import dayjs from 'dayjs';
import { useRecoilState } from 'recoil';
import { userState } from '@/store/data';
import _ from 'lodash';

export default function Login() {
    const router = useRouter();
    const {data:session, status} = useSession();
    const [loading, setLoading] = useState(false);
    const [user,setUser] = useRecoilState(userState);
    const [form] = Form.useForm();

    const checkPassword3Month = async (username) => {
      let result = await apiClient().post('/user/find', {username: username})
      let condition = dayjs(_.result(result, 'data[0].date_changepassword')).isBefore(dayjs().subtract(3,'months').format('YYYY-MM-DD'), 'day'); // > 3 month true
      console.log('condition 3 month',condition);
      return {
        condition,
        attempt: _.result(result, 'data[0].fail_attempt'),
        status: _.result(result, 'data[0].status'),
      }
    }

    const onFinish = async (values) => {
      setLoading(true); // ✅ เพิ่ม Loading State เพื่อป้องกัน UI กระตุก
    
      try {
        const { condition, attempt, status } = await checkPassword3Month(values?.username);
    
        if (status === 'lock') {
          message.error('User is locked, Please contact administrator to reset the password', 5);
          setLoading(false);
          return;
        }
    
        if (condition || status === 'changepassword') {
          setUser(values?.username);
          router.push('/auth/changePassword');
          return;
        }
    
        const result = await signIn('credentials', { 
          ...values, 
          redirect: false, 
          callbackUrl: '/landing'
        });
    
        if (!result?.ok) {
          router.push(`/auth/login?attempt=${+attempt + 1}`);
          form.setFieldsValue({ password: null }); // ✅ ใช้ `setFieldsValue()` แทน
        } else {
          router.push('/landing');
        }
      } catch (error) {
        console.error('Login Error:', error);
        message.error('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      const attempt = localStorage.getItem('attempt');
      if (attempt) {
        console.log('Login Attempts:', attempt);
      }
    }, []);
    
    return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 90px)' }}>
              <Row>
                <Col span={8} offset={8} style={{textAlign:'center'}}>
                  <Image src="/images/logo.png" preview={false} style={{width:'100%'}} />
                </Col>
                <Col span={8} offset={8}>
                  <Form form={form} name="login" onFinish={onFinish} layout="vertical">
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[{ required: true, message: 'Please enter your username' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item extra={<span>{router.query?.attempt>=4?'Please contract administrator to reset the password':''}</span>}>
                      
                      <Button type="primary" htmlType="submit" loading={loading} block>
                        Log in
                      </Button>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </div>
      );
}
