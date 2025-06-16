import React, { useState, useEffect } from 'react';
import { Col, Divider, Row } from 'antd';
import { Card, Space, Button } from 'antd';
import { AlertOutlined, SolutionOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { AutoComplete, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import { Table } from 'antd';
import axios from 'axios';
import { Breadcrumb,Menu } from 'antd';
import { Layout,theme,  } from 'antd';
import { LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
const { Search } = Input;
const { Content,Sider  } = Layout;
import { Select } from 'antd';
import { withAuth } from '@/utils/middleware';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items2 = [
  getItem(
      <Link href="/intrlligentDetail">Data Analytic</Link>,
      'intrlligentDetail',
      <UserOutlined />,
    ),
    getItem(
      <Link href="/checkErrorCode">Check Error Code</Link>,
      'checkErrorCode',
      <LaptopOutlined />,
    ),
    getItem(
      <Link href="/nvram">NVRAM Viewer</Link>,
      'nvram',
      <LaptopOutlined />,
    ),
    getItem(
      <Link href="/serviceManual">Service Manual & Diagram</Link>,
      'serviceManual',
      <LaptopOutlined />,
    ),
];
const columns = [
  {
    title: 'Error Name',
    dataIndex: 'symptom',
    key: 'symptom',
    render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />
  },
  {
    title: 'Part to be check',
    dataIndex: 'part',
    key: 'part',
    render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />
  },
  {
    title: 'Description',
    dataIndex: 'desc',
    key: 'desc',
    render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />
  },
  {
    title: 'Remedy',
    dataIndex: 'remedy',
    key: 'remedy',
    render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />
  },
];
const data = [];

const CheckErrorCode = () => {
  const [itemsModel, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const router = useRouter();
  const { subtype } = router.query;
  useEffect(() => {
    console.log(subtype);
    console.log('CheckErrorCode',`/api/manual/listModelSC?subtype=${subtype}`);
    fetch(`/api/manual/listModelSC?subtype=${subtype}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if(data){
          const transformedItems = data.map(item => ({
            key: item.model_name,
            label: item.model_name,
            manual: item.manual,
            diagram: item.diagram,
          }));
          setItems(transformedItems);
        }
      }).catch(error => {
        // Handle errors here
        console.error('Error fetching data:', error);
      });
    }, [subtype]);
  const handleModelSelect = item => {
    setSelectedItem(item);
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [model, setModel] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [tableData, setTableData] = useState([]);
  const handleModelSelectModel = async (errorCode) => {
    setErrorCode(errorCode);
    console.log('/api/errorCode/find');
    console.log('selectedItem',selectedItem);
    console.log('errorCode',errorCode);
    try {
      const response = await axios.post('/api/errorCode/find', {
        model: selectedItem,
        errorCode: errorCode,
      });
      console.log('response',response);
      const responseData = response.data.map(item => ({
        key: item.id, // Unique key for each row
        symptom: item.error_name,
        remedy: item.remedy,
        part: item.part_check,
        desc: item.desc,
      }));
      console.log('responseData',responseData);
      setTableData(responseData);
    } catch (error) {
      console.error(error);
    }
    
  };
  const handleReset = () => {
    setTableData([]);
    handleModelSelectModel([]);
  };
  return (
    <>
      <Row justify="center">
        <Col span={20} style={{ margin: '10px' }}>
          <Select
            showSearch
            style={{
              width: 200,
            }}
            placeholder="Search to Select"
            onChange={handleModelSelect}
            value={selectedItem}
          >
            {itemsModel.map(item => (
              <Select.Option key={item.key} value={item.label}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleReset}>Reset</Button>
        </Col>  
      </Row>
      <Row justify="center">
        <Col span={20} style={{ margin: '10px' }}>
        <Search
            placeholder="Enter number Error Code: "
            enterButton="Search"
            size="large"
            // Handle the input value as needed
            onChange={(e) => handleModelSelectModel(e.target.value)}
            // onSearch={(e) => handleModelSelectModel(e.target.value)}
            value={errorCode}
          />
        </Col>
      </Row>
      <Row justify="center" style={{ margin: '20px' }}>
        <Col span={20} style={{ margin: '10px' }}>
        <Table columns={columns} dataSource={tableData} />
        </Col>
      </Row>
    </>
  );
}

export async function getServerSideProps(context) {
  context.res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	 const session = await getSession(context);
	if (session==null) {
		return { redirect: { destination: '/auth/login?authen', permanent: false } }
	}
	return {props:{}}
}

export default withAuth(CheckErrorCode)