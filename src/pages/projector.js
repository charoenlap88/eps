import React, { useState, useEffect } from 'react';
import { Col, Divider, Row } from 'antd';
import { Card, Space, Button } from 'antd';
import { AlertOutlined, SolutionOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { AutoComplete, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import axios from 'axios';
import { Breadcrumb,Menu } from 'antd';
import { Layout,theme,  } from 'antd';
import { LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import { Table, Tag } from 'antd';
import { Select } from 'antd';
import { Modal } from 'antd';
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import { withAuth } from '@/utils/middleware';
import { useRouter } from 'next/router';
const { Content,Sider  } = Layout;
const {Option} = Select;
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
      <Link href="/projector">Data Analytic</Link>,
      'intrlligentDetail',
      <UserOutlined />,
    ),
    getItem(
      <Link href="/projectorServiceManual">Service Manual & Diagram</Link>,
      'serviceManual',
      <LaptopOutlined />,
    ),
];
const columns = [
  {
    title: 'Item',
    dataIndex: 'item',
    key: 'item',
  },
  {
    title: 'Current Value',
    dataIndex: 'currentValue',
    key: 'currentValue',
  },
];
const columnsResult = [
  {
    title: 'ช่วงเวลาที่เกิดอาการ',
    dataIndex: 'no',
    key: 'no',
  },
  {
    title: 'อาการ',
    dataIndex: 'symptom',
    key: 'symptom',
  },
  {
    title: 'อะไหล่ที่เกี่ยวข้อง',
    dataIndex: 'remedy',
    key: 'remedy',
  },
  {
    title: 'Part code',
    dataIndex: 'part',
    key: 'part',
  },
];
const { Dragger } = Upload;
const { Meta } = Card;

const props = {
  name: 'file',
  multiple: false,
  action: '/api/upload',
  method: 'post',
};
const propsCalculate = {
  name: 'file',
  multiple: false,
  action: '/api/analytic/readfile',
  method: 'post',
};
const Projector = () => {
  const [dataResult, setResponseData] = useState([]);
  const [dataResultDetail, setResponseDataDetail] = useState([]);
  const [itemsModel, setItems] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const { warning } = Modal;

  useEffect(() => {
    fetch('/api/analytic/list')
      .then(response => response.json())
      .then(data => {
        const transformedItems = data.map(item => ({
          key: item.model,
          label: item.model,
        }));
        setItems(transformedItems);
        //setSelectedModel('EB-FH52'); 
      });
  }, []);
  
  const handleModelSelect = model => {
    setSelectedModel(model);
  };

  axios.defaults.debug = false;
  const handleUpload = async (file) => {
    console.log(file);
    try {
        const params = {
          filename:file.name,
          model: selectedModel
        };
        axios.post('/api/analytic/readfile', params)
        .then((response) => {
          // console.log('Response:', response.data);
          if(response.data.errorData){
            setResponseData(response.data.errorData);
            setResponseDataDetail(response.data.information);
          }
          if (response.data.errorData.length === 0) {
            warning({
              title: 'Warning!',
              content: 'Data Empty',
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      
    } catch (error) {
      console.error('API Request Error:', error);
      setResponseData([]); // Set an empty array if there's an error in making the API request
    }
  
    console.log('end send axios');
  };

  const onChange = (value) => {
    setSelectedModel(value);
    console.log(`Searched: ${value}`);
  };
  const onSearch = (value) => {
    setSelectedModel(value);
    console.log(`Searched: ${value}`);
  };
  const filterOption = (input, option) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  const filteredResponseData = dataResult.filter(row => row.length > 0);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  
  const handleReset = () => {
    setResponseData([]);
    setResponseDataDetail([]);
  };
  return (
    <> 
      <Row justify="center">
        <Col span={20} style={{ margin: '10px' }}>
          <p>
            <b>Model</b>
          </p>
          <Select
            showSearch
            placeholder="Select an item"
            optionFilterProp="children"
            onChange={onChange}
            onSearch={onSearch}
            filterOption={filterOption}
            style={{ width: 200 }}
          >
            {itemsModel.map(item => (
              <Option key={item.key} value={item.key}>
                {item.label}
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleReset}>Reset</Button>
        </Col>
      </Row>
      <Row justify="center">
        <Col span={20} style={{ margin: '10px' }}>
          <Dragger
            className="custom-upload"
            {...props}
            onChange={(info) => {
              const { status, originFileObj } = info.file;
              if (status === 'done') {
                handleUpload(originFileObj);
              }
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned
              files.
            </p>
          </Dragger>
        </Col>
      </Row>
      <Row justify="center" style={{ margin: '20px' }}>
        <Col span={20} style={{ margin: '10px' }}>
          <Table columns={columns} dataSource={dataResultDetail} />
        </Col>
      </Row>
      <Row justify="center" style={{ margin: '20px' }}>
        <Col span={20} style={{ margin: '10px' }}>
        <Table columns={columnsResult} dataSource={dataResult} pagination={false} />
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

export default withAuth(Projector)
