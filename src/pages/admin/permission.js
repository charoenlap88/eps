import { apiClient } from "@/utils/apiClient";
import { Table, Row, Col, Button, Dropdown, Input, Form, Select, Modal, message, Badge, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined, AppstoreAddOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import _ from "lodash";
import { useSetRecoilState, useResetRecoilState } from "recoil";
import { initDrawerState, closeDrawerState } from "@/store/drawer";
import dayjs from 'dayjs'
import { getSession } from "next-auth/react";
import { mapUrl } from "@/utils/tools";

const FormPermission = ({ initialValues, onSubmit, mode, close }) => {
	const [form] = Form.useForm();

	const handleSubmit = () => {
		form.validateFields().then((values) => {
			onSubmit(values);
		});
	};

	return (
		<Form form={form} initialValues={initialValues} onFinish={handleSubmit}>
			{mode=='edit' && <Form.Item noStyle name="id"><Input type="hidden" /></Form.Item>}
			<Form.Item
				name="name"
				label="Permisison Name"
				rules={[{ required: true, message: "Please enter a permission name" }]}
			>
				<Input type="text" />
			</Form.Item>

			<Form.Item
				name="permission"
				label="Path Permission"
				rules={[{ required: true, message: "Please enter a path permission" }]}
			>
				<Input type="text" />
			</Form.Item>

			<Form.Item
				name="status"
				label="Status"
				rules={[{ required: true, message: "Please select a status" }]}
			>
				<Select>
					<Select.Option value="active">Active</Select.Option>
					<Select.Option value="inactive">Inactive</Select.Option>
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

const Permission = () => {
	const setDrawer = useSetRecoilState(initDrawerState);
	const closeDrawer = useResetRecoilState(closeDrawerState);

	const [dataSource, setDataSource] = useState([]);
	const [columns, setColumns] = useState([]);

    const updateHandler = async (values) => {
		values.updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
		let find = values?.id;
		values = _.omit(values,['id']); // username cannot change
		let result = await apiClient().put('/permission', values, {params: {id: find}});
		if (result?.data?.changedRows==1) {
			message.success('Update Success');
			await fetchData()
		} else {
			message.error('Fail Update');
		}
		closeDrawer()
    }

    const createHandler = async (values) => {
		let check = await apiClient().get('/permission', {params:{['name']:values?.name, ['del']: 0}});
		if (_.size(check?.data)==0) {
			values.created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
			let result = await apiClient().post('/permission', values);
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
		let result = await apiClient().delete("/permission", {params:{id:values?.id}, data: {updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss')}});
		if (result?.data?.affectedRows>0) {
			message.success('Delete Success');
			await fetchData()
		} else {
			message.error('Fail Delete');
		}
		closeDrawer()
    }

	const fetchData = async () => {
		let result = await apiClient().get("/permission");
        let ignoreShow = ['created_at','updated_at','del','id']; // hidden column
		let data = _.map(_.filter(_.keys(_.result(result?.data, "[0]")), f => !_.includes(ignoreShow, f)), (val, key) => ({
			title: _.upperFirst(val),
			dataIndex: val,
			key: val,
			...(
				val=='status'
				? {render:(text)=><Tag color={(text=='active'?'success':'error')}>{text}</Tag>}
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
					disabled={_.includes(['*', '/admin/*'], record?.permission)}
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
											<FormPermission
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
								key: "delete",
								label: "Delete",
								icon: <DeleteOutlined />,
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
                            <FormPermission
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
		console.log('url', currentUrl, sessionPermissions);
		const isAllowed = mapUrl(currentUrl, sessionPermissions);
		console.log(isAllowed);
		if (isAllowed) {
			return {props:{}}
		} else {
			return {redirect: {destination: '/admin/logout', permanent: false}}
		}
	}
}

export default Permission;
