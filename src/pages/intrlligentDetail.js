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
import { useRouter } from 'next/router';
import { withAuth } from '@/utils/middleware';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
const { Content,Sider  } = Layout;
const { Option } = Select;
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
    title: 'Items',
    dataIndex: 'Items',
    key: 'items',
  },
  {
    title: 'CurrentValue',
    dataIndex: 'CurrentValue',
    key: 'CurrentValue',
  },
  
  {
    title: 'Limit',
    dataIndex: 'Limit',
    key: 'Limit',
  },
  {
    title: 'Situation',
    dataIndex: 'Situation',
    key: 'Situation',
  },
];
const columnsResult = [
  {
    title: 'No',
    dataIndex: 'no',
    key: 'no',
  },
  {
    title: 'Symptom / Detail',
    dataIndex: 'symptom',
    key: 'symptom',
    render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />,
  },
  {
    title: 'Remedy',
    dataIndex: 'remedy',
    key: 'remedy',
    render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />,
  },
  {
    title: 'Part Code',
    dataIndex: 'part',
    key: 'part',
    render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />,
  },
];
const dataResult = [];
const { Dragger } = Upload;
const { Meta } = Card;

const items = [
  {
    key: '1',
    label: (
      <Link target="_blank" rel="noopener noreferrer" href="#">
        Model item
      </Link>
    ),
  },
];
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
const IntelligentDetail = () => {
  const [responseData, setResponseData] = useState([]);
  const [errorData, setErrorData] = useState([]);
  const [errorDataTable, setTableData] = useState([]);
  const [selectedItem, setSelectedItem] = useState();
  const [itemsModel, setItems] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const router = useRouter();
  const { subtype } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/manual/listModelSC?subtype=${subtype}`)
      .then(response => response.json())
      .then(data => {
        const transformedItems = data.map(item => ({
          key: item.model_name,
          label: item.model_name,
        }));
        setItems(transformedItems);
      });
  }, [subtype]);
  
  const handleModelSelect = model => {
    setSelectedModel(model);
    
    setResponseData([]);
    setErrorData([]);
    setTableData([]);
    // setSelectedModel([...selectedModel, model]);
  };

  axios.defaults.debug = false;
  
  const handleUpload = async (file) => {
    try {
      let resultResponseData = [];
      let dataInsert = [];
      
      if (selectedModel === "") {
          message.error("Please select a model before uploading.");
          return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('selectedModel', selectedModel);
      
      const response = await axios.post('/api/uploadExcel', formData);
      console.log('response', response);
      if (response.data && response.data.worksheetData && Array.isArray(response.data.worksheetData)) {
          console.log('response.data', response.data);
          console.log('response.data.worksheetData', response.data.worksheetData);
          console.log('response.data.errorData', response.data.errorData);
          setResponseData(response.data.worksheetData);
          setErrorData(response.data.errorData);

          // 🔹 Ensure `errorData` is valid before accessing `errorData[0].symptom`
          if (response.data.errorData && response.data.errorData.length > 0) {
              let symptomResponse = response.data.errorData[0]?.symptom; // Use optional chaining
              console.log(symptomResponse);
              try {
                  const responseErr = await axios.post('/api/errorCode/find', {
                      model: selectedModel,
                      errorCode: symptomResponse,
                  });

                  resultResponseData = responseErr.data.map(item => ({
                      key: item.id,
                      symptom: item.error_name,
                      remedy: item.remedy,
                      part: item.part_check,
                  }));

                  if (responseErr.data.length > 0) {
                      response.data.errorShow = response.data.errorShow.slice(1);

                      dataInsert = {
                          no: '1',
                          symptom: responseErr.data[0].error_name,
                          remedy: responseErr.data[0].remedy,
                          part: responseErr.data[0].part_check,
                      };
                      setTableData(dataInsert);
                  }

              } catch (error) {
                  console.error("Error fetching error codes:", error);
              }

              let mergedData = [];
              if (dataInsert.length) {
                  mergedData = [dataInsert, ...response.data.errorShow];
              } else {
                  mergedData = [...response.data.errorShow];
              }
              setTableData(mergedData);

          } else {
              console.warn("No errorData found in response");
          }

      } else {
          setResponseData([]); // If response is invalid, set empty array
      }

    } catch (error) {
        console.error("Upload Error:", error);
        setResponseData([]); // Reset state on error
    }
  };
    
  const handleReset = () => {
    setResponseData([]);
    setErrorData([]);
    setTableData([]);
    setSelectedItem('');
  };
  return (
    <>
      <Row justify="center">
        <Col span={20} style={{ marginTop: '10px' }}>
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
        {responseData.length > 0 ? (
          <Table
            dataSource={responseData}
            columns={columns}
          />
        ) : (
          <div>No data to display.</div>
        )}
        </Col>
      </Row>
      <Row justify="center" style={{ margin: '20px' }}>
        <Col span={20} style={{ margin: '10px' }}>
        {errorDataTable.length >0? (
          <Table columns={columnsResult} dataSource={errorDataTable} />
          ) : (
            <div>No error data to display.</div>
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

export default withAuth(IntelligentDetail)