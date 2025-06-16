import { apiClient } from "@/utils/apiClient";
import { Table, Row, Col, Button, Dropdown, Input, Form, Select, Modal, message, Badge, Tag, Transfer } from "antd";
import React, { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined, AppstoreAddOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import _ from "lodash";
import { useSetRecoilState, useResetRecoilState } from "recoil";
import { initDrawerState, closeDrawerState } from "@/store/drawer";
import dayjs from 'dayjs'
import { decode, hashPassword, generateSalt } from '@/utils/encryption';
import { getSession } from "next-auth/react";
import { mapUrl } from "@/utils/tools";

const FormTransfer = ({ initialValues, onSubmit, close }) => {
	const [form] = Form.useForm();
	const [mockData, setMockData] = useState([]);
	const [targetKeys, setTargetKeys] = useState([]);
	
	const getLists = async () => {
		let result = await apiClient().get('/role', {params:{'r.status':'active'}});
		setMockData(_.map(result?.data, val => ({
			key: val?.id,
			title: `${val?.name}`,
		})));
		if (initialValues?.roles_id && !_.isEmpty(initialValues?.roles_id)) {
			let valRoles = _.map(_.split(initialValues?.roles_id, ','), v => +v);
			console.log('initialValues?.roles_id', valRoles);
			setTargetKeys(valRoles);
			form.setFieldValue('role_id', JSON.stringify(valRoles));
		}
	}
	
	const filterOption = (inputValue, option) => _.indexOf(_.lowerCase(option.title), _.lowerCase(inputValue)) > -1 || _.startsWith(_.lowerCase(option.title), _.lowerCase(inputValue));
	const handleChange = (newTargetKeys) => {
	  setTargetKeys(newTargetKeys);
	  console.log(newTargetKeys);
	  form.setFieldValue('role_id', JSON.stringify(newTargetKeys));
	};
	const handleSearch = (dir, value) => {
	  console.log('search:', dir, value);
	};
	
	useEffect(() => {
		getLists();
	}, [initialValues])
	

	return (
		<Form form={form} initialValues={{user_id: initialValues?.id}} onFinish={onSubmit}>
			<Row>
				<Col span={24}>
					<Transfer 
						dataSource={mockData}
						targetKeys={targetKeys}
						render={(item) => item.title}
						filterOption={filterOption}
						onChange={handleChange}
						onSearch={handleSearch}
						showSearch
						disabled={initialValues?.username=='admin'}
					/>
				</Col>
				<Col span={24}>
					<Form.Item name="user_id" noStyle>
						<Input type="hidden" />
					</Form.Item>
					<Form.Item name="role_id" noStyle>
						<Input type="hidden" />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" disabled={initialValues?.username=='admin'}>Save</Button>
					</Form.Item>
				</Col>
			</Row>
		</Form>
	)
}

const FormUser = ({ initialValues, onSubmit, mode, close }) => {
	const [form] = Form.useForm();

	const handleSubmit = () => {
		form.validateFields().then((values) => {
			
			if (mode=='create') {
				values.status = 'active';
				let newSalt = generateSalt();
				values.salt = newSalt;
				values.created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
			} else {
				values.updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
			}
			onSubmit(values);
		});
	};

	return (
		<Form form={form} initialValues={initialValues} onFinish={handleSubmit}>
			{mode=='edit' && <Form.Item noStyle name="id"><Input type="hidden" /></Form.Item>}
			<Form.Item
				name="username"
				label="Username"
				rules={[{ required: true, message: "Please enter a username" }]}
			>
				<Input type="text" disabled={mode=='edit'} />
			</Form.Item>

			<Form.Item
				name="status"
				label="Status"
				rules={[{ required: true, message: "Please select a status" }]}
			>
				<Select>
					<Select.Option value="active">Active</Select.Option>
					<Select.Option value="inactive">Inactive</Select.Option>
					<Select.Option value="changepassword">Init Password</Select.Option>
				</Select>
			</Form.Item>

			<Form.Item>
				<Button type="primary" htmlType="submit">
					Save
				</Button>
			</Form.Item>
		</Form>
	);
};

const User = () => {
	const setDrawer = useSetRecoilState(initDrawerState);
	const closeDrawer = useResetRecoilState(closeDrawerState);

	const [dataSource, setDataSource] = useState([]);
	const [columns, setColumns] = useState([]);

	const updateRoles = async (values) => {
		if (typeof values?.role_id == 'string') {
			values.role_id = JSON.parse(values.role_id);
		}
		console.log('updaterols', values);
		values.role_id = _.uniq(values.role_id)
		await apiClient().post('/user/role', values)
		closeDrawer();
		await fetchData();
	}

    const updateHandler = async (values) => {
		values.updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
		let find = values?.id;
		values = _.omit(values,['id','username']); // username cannot change
		let result = await apiClient().put('/user', values, {params: {id: find}});
		if (result?.data?.changedRows==1) {
			message.success('Update Success');
			await fetchData()
		} else {
			message.error('Fail Update');
		}
		closeDrawer()
    }

    const createHandler = async (values) => {
		let check = await apiClient().get('/user', {params:{['u.username']: _.trim(values?.username), ['u.del']: 0}});
		if (_.size(check?.data)==0) {
			values.created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
			values.status = 'changepassword'
			let result = await apiClient().post('/user', values);
			if (result?.data?.insertId) {
				message.success('Create Success');
				await fetchData()
			} else {
				message.error('Fail Create');
			}
		} else {
			message.error('Duplicate username');
		}
		closeDrawer()
    }

    const deleteHandler = async (values) => {
		values.updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
		let result = await apiClient().delete("/user", {params:{id:values?.id}, data: {updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss')}});
		if (result?.data?.affectedRows>0) {
			message.success('Delete Success');
			await fetchData()
		} else {
			message.error('Fail Delete');
		}
		closeDrawer()
    }

	const fetchData = async () => {
		let result = await apiClient().get("/user");
		let ignoreShow = ['roles_id', 'id', 'permissions']; // hidden column
		let data = _.map(_.filter(_.keys(_.result(result?.data, "[0]")), f => !_.includes(ignoreShow, f)), (val, key) => ({
			title: _.upperFirst(val),
			dataIndex: val,
			key: val,
			textWrap: 'word-break',
			ellipsis: true,
			...(
				val=='status'
				? {render:(text)=><Tag color={(text=='active'?'success':(text=='changepassword'?'warning':'error'))}>{text}</Tag>}
				: {}
			)
		}));
		data = _.concat(data, {
			key: "action",
			dataIndex: "action",
			title: "Action",
			render: (text, record, index) => (
				<Dropdown
					placement="bottomRight"
					arrow
					disabled={record?.username=='admin'}
					menu={{
						items: [
							{
								key: "edit",
								label: "Edit",
								icon: <EditOutlined />,
								
								onClick: () => {
									setDrawer({
										title: "Edit",
										content: (
											<FormUser
                                                onSubmit={updateHandler}
                                                initialValues={record}
												mode="edit"
												close={() => closeDrawer()}
											/>
										),
									});
								},
							},
							{
								key: "role",
								label: "Map Role",
								icon: <DeleteOutlined />,
                                onClick: () => {
									setDrawer({
										title: "Map Role",
										content: (
											<FormTransfer
                                                onSubmit={updateRoles}
                                                initialValues={record}
												close={() => closeDrawer()}
											/>
										),
									});
                                }
							},
							{
								key: "delete",
								label: "Delete",
								icon: <DeleteOutlined />,
								disabled: record?.username=='admin',
								danger: true,
                                onClick: () => {
                                    Modal.confirm({
                                        title: 'Confirm',
                                        icon: <ExclamationCircleOutlined />,
                                        content: 'Are you sure delete this record?',
                                        okText: 'Confirm Delete',
                                        okButtonProps: {danger:true},
                                        cancelText: 'Cancel',
                                        onOk: async () => await deleteHandler(record)
                                    });
                                }
							},
						],
					}}
				>
					<Button>Action</Button>
				</Dropdown>
			),
		});
		setColumns(data);
		setDataSource(_.map(result?.data, (v, k) => ({ ...v, key: k })));
	};

	useEffect(() => {
		(async () => {
			if (_.size(dataSource) == 0) {
				await fetchData();
			}
		})();
	}, []);

	return (
		<Row>
            <Col span={24}>
                <Button onClick={()=>{
                    setDrawer({
                        title: "Create",
                        content: (
                            <FormUser
                                onSubmit={createHandler}
                                initialValues={{status:'active'}}
                                mode="create"
                                close={() => closeDrawer()}
                            />
                        ),
                    });
                }}><AppstoreAddOutlined /> Create</Button>
            </Col>
			<Col span={24}>
				<Table dataSource={dataSource} columns={columns} />
			</Col>
		</Row>
	);
};

export async function getServerSideProps(context) {
    context.res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	const session = await getSession(context);
	if (!session) {
		return {redirect: {destination: '/admin/logout', permanent: false}}
	} else {
		const sessionPermissions = _.split(session.user.permissions, ',');
		const currentUrl = context.resolvedUrl;
		console.log('url', session.user.username, currentUrl, sessionPermissions);
		const isAllowed = mapUrl(currentUrl, sessionPermissions);
		console.log(isAllowed);
		if (isAllowed) {
			return {props:{}}
		} else {
			return {redirect: {destination: '/admin/logout', permanent: false}}
		}
	}
}

export default User;
