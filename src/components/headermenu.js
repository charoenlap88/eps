import React from 'react'
import { HomeOutlined } from '@ant-design/icons';
import { Layout, theme, Menu } from "antd";
import{  Image  } from 'antd';
import { useSession } from 'next-auth/react';
const { Header } = Layout;

const HeaderMenu = () => {
  const { data: session, status } = useSession();

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        padding: '0 30px',
        background: '#231f20',
        color: '#fff'
      }}
    >
      <h2>SMART CS DCA</h2>
    </Header>
  )
}

export default HeaderMenu