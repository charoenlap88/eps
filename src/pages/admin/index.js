// admin/index.js

import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { apiClient } from "@/utils/apiClient";
import { hashPassword } from "@/utils/encryption";
import { useRouter } from "next/router";
import { useSession, signIn } from 'next-auth/react';
import { mapUrl } from "@/utils/tools";

const AdminLogin = () => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
    const router = useRouter();

	const onFinish = async (values) => {
		setLoading(true);
        let old = await apiClient().post('/user/find',{username:values.username});
        let salt = old?.data[0]?.salt;
        let result = await apiClient().post('/user/login', {username:values.username, password: hashPassword(values.password, salt)}).catch(e => console.log(e))
        if (result?.status==200 && _.size(result?.data)>0) {
            await apiClient().put('/user/attempt', {username: values.username, attempt: 0})
            // let user = await apiClient().get('/user', {params:{'u.username': values.username}})
            let resultLogin = await signIn('credentials', {...values, redirect: false, callbackUrl: '/admin/user' })
            if (resultLogin.status==200 && resultLogin?.ok) {
                router.push('/admin/user')
            } else {
                message.error('Cannot Login')
            }
            
            
        } else {
            await apiClient().put('/user/attempt', {username: values.username, attempt: +old?.data[0].fail_attempt+1})
            message.error('Fail Login')
        }
        setLoading(false);
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
			}}
		>
			<div
				style={{
					width: "300px", // Adjust the width as needed
					textAlign: "center",
				}}
			>
				<h1>Admin Login</h1>
				<Form
					form={form}
					onFinish={onFinish}
					style={{ maxWidth: "300px", margin: "0 auto" }}
				>
					<Form.Item
						name="username"
						rules={[
							{
								required: true,
								message: "Please enter your username",
							},
						]}
					>
						<Input placeholder="Username" />
					</Form.Item>

					<Form.Item
						name="password"
						rules={[
							{
								required: true,
								message: "Please enter your password",
							},
						]}
					>
						<Input.Password placeholder="Password" />
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
						>
							Log In
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default AdminLogin;
