import React, { useEffect,useState } from 'react';
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
import { DownloadOutlined } from '@ant-design/icons';
import { Select } from 'antd';
const { Search } = Input;
const { Content,Sider  } = Layout;
import Link from 'next/link';
import { withAuth } from '@/utils/middleware';
import { getSession } from 'next-auth/react';
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
const columns = [
  {
    title: 'Symptom / Detail',
    dataIndex: 'symptom',
    key: 'symptom',
  },
  {
    title: 'Remedy',
    dataIndex: 'remedy',
    key: 'remedy',
  },
  {
    title: 'Part Code',
    dataIndex: 'part',
    key: 'part',
  },
];
const data = [
  {
    key: '1',
    no: '1',
    symptom: 'Total Print 136,000 ㎡',
    remedy: 'Replace Print Head',
    part: 'FA61002 “Print Head”',
  },
];
const OtherServiceManualLIJ = () => {
  const [itemsModel, setItems] = useState([]);
  const [itemToUrl, setItemsUrl] = useState([]);
  const [selectedManual, setSelectedManual] = useState(null);
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  useEffect(() => {
    fetch('/api/manual/listModelJIL')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const transformedItems = data.map(item => ({
          key: item.model_name,
          label: item.model_name,
          manual: item.manual,
          diagram: item.diagram,
        }));
        setItems(transformedItems);
      });
  }, []);
  const handleModelSelect = (value) => {
    // Find the selected item and set the corresponding manual and diagram
    const selectedItem = itemsModel.find(item => item.label === value);
    setSelectedItem(value);

    const manual_parts = selectedItem.manual ? selectedItem.manual.split("\\") : [];
    const manual_filename = manual_parts[manual_parts.length - 1];
    const manual_apiEndpoint = `api/download?file=${encodeURIComponent(manual_filename)}&path=${encodeURIComponent(manual_parts.slice(0, -1).join(","))}`;
    setSelectedManual(manual_apiEndpoint);

    const parts = selectedItem.diagram ? selectedItem.diagram.split("\\") : [];
    const filename = parts[parts.length - 1];
    const apiEndpoint = `api/download?file=${encodeURIComponent(filename)}&path=${encodeURIComponent(parts.slice(0, -1).join(","))}`;
    setSelectedDiagram(apiEndpoint);
  };
  const onChange = (selectedValue) => {
    if (selectedValue) {
      if (selectedValue.startsWith('AM')) {
        setItemsUrl('AM')
        // window.open('https://www.google.com', '_blank');
      } else if (selectedValue.startsWith('WF')) {
        setItemsUrl('WF')
        // window.open('https://www.facebook.com', '_blank');
      }
    }
  };
  const btnClick = () => {
    if(itemToUrl!=''){
      if(itemToUrl=='AM'){
        window.open('errorCode/WF-C21000_C20750_C20600_Rev.H_Manual/73105644.html', '_blank');
      }else{
        window.open('errorCode/WF-C21000_C20750_C20600_Rev.H_Manual/4883517.html', '_blank');
      }
    }
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  
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
      <Row justify="center" style={{ margin: '20px' }}>
        <Col span={20} style={{ margin: '10px' }}>
          {selectedManual && (
            <a href={`${selectedManual}`} target="_blank" rel="noopener noreferrer">
              <Button type="primary" shape="round" icon={<DownloadOutlined />} size="large">
                Service Manual
              </Button>
            </a>
          )}
        </Col>
        <Col span={20} style={{ margin: '10px' }}>
          {selectedDiagram && (
            <a href={`${selectedDiagram}`} target="_blank" rel="noopener noreferrer">
              <Button type="primary" shape="round" icon={<DownloadOutlined />} size="large">
                Diagram
              </Button>
            </a>
          )}
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

export default withAuth(OtherServiceManualLIJ)