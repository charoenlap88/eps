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
import Link from 'next/link';
import { Select } from 'antd';
import { getSession } from 'next-auth/react';
import { withAuth } from '@/utils/middleware';
import { useRouter } from 'next/router';
const { Search } = Input;
const { Content,Sider  } = Layout;
import { useSession } from "next-auth/react";
const ProjectorServiceManual = () => {
  const [itemsModel, setItems] = useState([]);
  const [selectedManual, setSelectedManual] = useState(null);
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRescue, setSelectedRescue] = useState(null);
  const router = useRouter();
  const { type } = router.query;
  
  useEffect(() => {
    fetch(`/api/manual/listModelOther?type=${type}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if(data){
          const transformedItems = data.map(item => ({
            key: item.model_name,
            label: item.model_name,
            manual: item.manual,
            diagram: item.diagram,
            rescue: item.rescue 
          }));
          setItems(transformedItems);
        }
      });
  }, []);
  const handleModelSelect = (value) => {
    // Find the selected item and set the corresponding manual and diagram
    const selectedItem = itemsModel.find(item => item.label === value);
    console.log('value', value);
    setSelectedItem(value);

    const manual_parts = selectedItem.manual ? selectedItem.manual.split("\\") : [];
    console.log("manual_parts", manual_parts);

    const manual_filename = manual_parts.length > 0 ? manual_parts[manual_parts.length - 1] : "";
    if (manual_filename) {
        const manual_apiEndpoint = `api/download?file=${encodeURIComponent(manual_filename)}&path=${encodeURIComponent(manual_parts.slice(0, -1).join(","))}`;
        setSelectedManual(manual_apiEndpoint);
    } else {
        setSelectedManual(null);
    }

    const parts = selectedItem.diagram ? selectedItem.diagram.split("\\") : [];
    console.log("parts", parts);

    const filename = parts.length > 0 ? parts[parts.length - 1] : "";
    if (filename) {
        const apiEndpoint = `api/download?file=${encodeURIComponent(filename)}&path=${encodeURIComponent(parts.slice(0, -1).join(","))}`;
        setSelectedDiagram(apiEndpoint);
    } else {
        setSelectedDiagram(null);
    }


    const rescue_parts = selectedItem?.rescue ? selectedItem.rescue.split("\\") : [];
    const rescue_filename = rescue_parts.length > 0 ? rescue_parts[rescue_parts.length - 1] : "";

    console.log("rescue_parts", rescue_parts);

    if (rescue_filename) {
        const rescue_apiEndpoint = `api/download?file=${encodeURIComponent(rescue_filename)}&path=${encodeURIComponent(rescue_parts.slice(0, -1).join(","))}`;
        setSelectedRescue(rescue_apiEndpoint);
    } else {
        setSelectedRescue(null); // หรือไม่ต้องตั้งค่าอะไรเลย
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
        {selectedRescue && (
            <Col span={20} style={{ margin: '10px' }}>
                <Link href={`${selectedRescue}`} target="_blank" rel="noopener noreferrer">
                    <Button type="primary" shape="round" icon={<DownloadOutlined />} size="large">
                        Rescue
                    </Button>
                </Link>
            </Col>
        )}

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

export default withAuth(ProjectorServiceManual)