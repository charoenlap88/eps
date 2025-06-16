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
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import { withAuth } from '@/utils/middleware';
import { Select } from 'antd';
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
      <Link href="/otherCheckErrorCodeLIJ">Check Error Code</Link>,
      'checkErrorCode',
      <LaptopOutlined />,
    ),
    getItem(
      <Link href="/otherServiceManualLIJ">Service Manual & Diagram</Link>,
      'serviceManual',
      <LaptopOutlined />,
    ),
];
const OtherCheckErrorCodeLIJ = () => {
  const [itemsModel, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  useEffect(() => {
    fetch('/api/manual/listModelJIL')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const dataArray = Array.isArray(data) ? data : [data];
        const transformedItems = dataArray.map(item => ({
          key: item.model_name,
          label: item.model_name,
          typeModel:'LIJ'
        }));
        setItems(transformedItems);
      });
  }, []);
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
    try {
      const response = await axios.post('/api/errorCode/find', {
        model: selectedItem,
        errorCode: errorCode,
        type:'LIJ'
      });
      const responseData = response.data.map(item => ({
        key: item.id, // Unique key for each row
        symptom: item.error_name,
        remedy: item.remedy,
        part: item.part_check,
      }));
      setTableData(responseData);
    } catch (error) {
      console.error(error);
    }
    
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
        </Col>
      </Row>
      <Row justify="center">
        <Col span={20} style={{ margin: '10px' }}>
          <Link href={selectedItem && selectedItem.startsWith('AM') ? '/errorCode/ServiceManual_AM-C6000_C5000_C4000/content/73105644.html' : '/errorCode/WF_C21000_C20750_C20600_Rev.H_Manual/content/4883517.html'} target="_blank">
              <Button type="primary">Search error code</Button>
          </Link>
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

export default withAuth(OtherCheckErrorCodeLIJ)