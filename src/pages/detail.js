import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import React, { useState } from 'react';
import {
    Button,
    Card,
    ConfigProvider,
    DatePicker,
    Divider,
    Input,
    Radio,
    Select,
    Space,
    Table,
    Tabs,
  } from 'antd';
  import { TreeSelect } from 'antd';
import { withAuth } from '@/utils/middleware';
import { getSession } from 'next-auth/react';
  
  const { TabPane } = Tabs;
const { Header, Content, Footer, Sider } = Layout;
const treeData = [
    {
      value: 'parent 1',
      title: 'parent 1',
      children: [
        {
          value: 'parent 1-0',
          title: 'parent 1-0',
          children: [
            {
              value: 'leaf1',
              title: 'leaf1',
            },
            {
              value: 'leaf2',
              title: 'leaf2',
            },
          ],
        },
        {
          value: 'parent 1-1',
          title: 'parent 1-1',
          children: [
            {
              value: 'leaf3',
              title: (
                <b
                  style={{
                    color: '#08c',
                  }}
                >
                  leaf3
                </b>
              ),
            },
          ],
        },
      ],
    },
  ];
const items1 = ['1', '2', '3'].map((key) => ({
  key,
  label: `nav ${key}`,
}));
const options = [];
for (let i = 10; i < 36; i++) {
  options.push({
    value: i.toString(36) + i,
    label: i.toString(36) + i,
  });
}
const handleChange = (value) => {
  console.log(`selected ${value}`);
};
const Detail = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [value, setValue] = useState();
  const onChange = (newValue) => {
    setValue(newValue);
  };
  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="demo-logo" />
        {/* <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} items={items1} /> */}
      </Header>
      <Content
        style={{
          padding: '0 50px',
        }}
      >
        <Breadcrumb
          style={{
            margin: '16px 0',
          }}
        >
          <Breadcrumb.Item><a href="home">Home</a></Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <Layout
          style={{
            padding: '24px 0',
            background: colorBgContainer,
          }}
        >
          <Sider
            style={{
              background: colorBgContainer,
            }}
            width={200}
          >
            <Menu theme={theme} mode="inline" defaultSelectedKeys={['1']}>
                <Menu.Item key="1" icon={<UserOutlined />}>
                    เช็คอะไหล่
                </Menu.Item>
                <Menu.Item key="2" icon={<LaptopOutlined />}>
                    <a href="pdf/dummy.pdf" target="_blank">User manual</a>
                </Menu.Item>
                <Menu.Item key="3" icon={<NotificationOutlined />}>
                    <a href="pdf/dummy.pdf" target="_blank">Spec</a>
                </Menu.Item>
            </Menu>
          </Sider>
          <Content
            style={{
              padding: '0 24px',
              minHeight: 280,
            }}
          >
            <TreeSelect
                showSearch
                style={{
                    width: '100%',
                }}
                value={value}
                dropdownStyle={{
                    maxHeight: 400,
                    overflow: 'auto',
                }}
                placeholder="Please select"
                allowClear
                treeDefaultExpandAll
                onChange={onChange}
                treeData={treeData}
                />
            <Tabs defaultActiveKey="1">
                <TabPane tab="Tab 1" key="1">
                    <Card title="Detail">
                        <Table
                        columns={[
                            { title: 'Title', dataIndex: 'name' },
                            { title: 'Value', dataIndex: 'age' },
                        ]}
                        dataSource={[
                            { key: '1', name: 'Brown', age: 32 },
                            { key: '2', name: 'Green', age: 42 },
                            { key: '3', name: 'Black', age: 32 },
                        ]}
                        />
                    </Card>
                </TabPane>
                <TabPane tab="Tab 2" key="2">
                Content of Tab Pane 2
                </TabPane>
                <TabPane tab="Tab 3" key="3">
                Content of Tab Pane 3
                </TabPane>
            </Tabs>
            <Input.TextArea allowClear />
          </Content>
        </Layout>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Epson
      </Footer>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  context.res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	 const session = await getSession(context);
	if (session==null) {
		return { redirect: { destination: '/auth/login?authen', permanent: false } }
	}
	return {props:{}}
}

export default withAuth(Detail)