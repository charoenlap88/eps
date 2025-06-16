import React, { useEffect, useState } from "react";
import { useRecoilState } from 'recoil';
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";
import { breadcrumbState, titleState, selectedUrlState } from "@/store/page";
import _ from 'lodash';
import { useSession } from "next-auth/react";
import { mapUrl } from "@/utils/tools";
const { Sider } = Layout;

const Sidebar = () => {
  const { data: session, status } = useSession();
  const [bc, setBc] = useRecoilState(breadcrumbState);
  const [title, setTitle] = useRecoilState(titleState);
  const [selectedUrl, setSelectedUrl] = useRecoilState(selectedUrlState);

  const router = useRouter();
  const { subtype } = router.query;

  const [items, setItems] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [currentMenuItem, setCurrentMenuItem] = useState([]);

  // สร้าง list key ของเมนูที่มี children
  const generateAllOpenKeys = (menuItems) => {
    return menuItems
      .filter((item) => item.children) // Only items with children
      .map((item) => item.key);
  };

  // ฟังก์ชันหา selectedKeys กับ openKeys จาก url
  const findMenuKeysByUrl = (url) => {
    let selected = [];
    let opens = [];

    _.forEach(items, (item) => {
      if (item.href && url.startsWith(item.href)) {
        selected = [item.key];
        opens = [];
      }
      if (item.children) {
        _.forEach(item.children, (child) => {
          if (child.href && url.startsWith(child.href)) {
            selected = [child.key];
            opens = [item.key];
          }
        });
      }
    });

    return { selected, opens };
  };

  // Update openKeys และ selectedKeys เมื่อ items หรือ url เปลี่ยน
  useEffect(() => {
    if (items.length === 0) return;

    // เลือกใช้ recoil url ถ้ามี หรือ router.asPath ถ้าไม่มี recoil url
    const urlToUse = selectedUrl || router.asPath || router.pathname;

    const { selected, opens } = findMenuKeysByUrl(urlToUse);
    setCurrentMenuItem(selected);
    setOpenKeys(opens);
  }, [items, selectedUrl, router.asPath]);

  // อัพเดตเมนูตาม pathname และ subtype เหมือนเดิม
  useEffect(() => {
    if (router.pathname === '/intrlligentDetail' || router.pathname === '/checkErrorCode' || router.pathname === '/nvram' || router.pathname === '/serviceManual') {
      setItems([
        {
          key: 'dataanalytics', label: 'Data Analytics', children: [
            { key: 'listdataanalytic', label: 'List Model Analytic', href: '/intelligent' },
            { key: 'dataanalytic', label: 'Data Analytic', href: `/intrlligentDetail?subtype=${subtype}` },
            { key: 'checkerrorcode', label: 'Check Error Code', href: `/checkErrorCode?subtype=${subtype}` },
            { key: 'nvram', label: 'NVRAM Viewer', href: `/nvram?subtype=${subtype}` },
            { key: 'servicemanual', label: 'Service Manual & Diagram', href: `/serviceManual?subtype=${subtype}` },
          ]
        },
        {
          key: 'datacenter', label: 'Data Center', children: [
            { key: 'specification', label: 'Specification', href: '/specification' },
            { key: 'comparison', label: 'Comparison', href: '/comparison' },
            { key: 'manual', label: 'User Manual', href: '/manualDetail' },
            { key: 'knowledgebase', label: 'Knowledge Base', href: '/knowledgeBase' },
          ]
        },
        { key: 'divider', type: 'divider' },
        { key: 'logout', label: 'Logout', href: '/auth/logout' },
      ]);
    } else if (router.pathname === '/projector' || router.pathname === '/projectorServiceManual') {
      setItems([
        {
          key: 'dataanalytics', label: 'Data Analytics Projector', children: [
            { key: 'listdataanalytic', label: 'List Model Analytic', href: '/intelligent' },
            { key: 'dataanalytic', label: 'Data Analytic', href: '/projector' },
            { key: 'servicemanual', label: 'Service Manual & Diagram', href: '/projectorServiceManual' },
          ]
        },
        {
          key: 'datacenter', label: 'Data Center', children: [
            { key: 'specification', label: 'Specification', href: '/specification' },
            { key: 'comparison', label: 'Comparison', href: '/comparison' },
            { key: 'manual', label: 'User Manual', href: '/manualDetail' },
            { key: 'knowledgebase', label: 'Knowledge Base', href: '/knowledgeBase' },
          ]
        },
        { key: 'divider', type: 'divider' },
        { key: 'logout', label: 'Logout', href: '/auth/logout' },
      ]);
    } else if (router.pathname === '/otherCheckErrorCodeLIJ' || router.pathname === '/otherServiceManualLIJ') {
      setItems([
        {
          key: 'dataanalytics', label: 'Data Analytics LIJ', children: [
            { key: 'listdataanalytic', label: 'List Model Analytic', href: '/intelligent' },
            { key: 'checkerrorcode', label: 'Check Error Code', href: '/otherCheckErrorCodeLIJ' },
            { key: 'servicemanual', label: 'Service Manual & Diagram', href: '/otherServiceManualLIJ' },
          ]
        },
        {
          key: 'datacenter', label: 'Data Center', children: [
            { key: 'specification', label: 'Specification', href: '/specification' },
            { key: 'comparison', label: 'Comparison', href: '/comparison' },
            { key: 'manual', label: 'User Manual', href: '/manualDetail' },
            { key: 'knowledgebase', label: 'Knowledge Base', href: '/knowledgeBase' },
          ]
        },
        { key: 'divider', type: 'divider' },
        { key: 'logout', label: 'Logout', href: '/auth/logout' },
      ]);
    } else if (router.pathname === '/otherCheckErrorCode' || router.pathname === '/otherServiceManual') {
      setItems([
        {
          key: 'dataanalytics', label: 'Data Analytics RIPs', children: [
            { key: 'listdataanalytic', label: 'List Model Analytic', href: '/intelligent' },
            { key: 'checkerrorcode', label: 'Check Error Code', href: '/otherCheckErrorCode' },
            { key: 'servicemanual', label: 'Service Manual & Diagram', href: '/otherServiceManual' },
          ]
        },
        {
          key: 'datacenter', label: 'Data Center', children: [
            { key: 'specification', label: 'Specification', href: '/specification' },
            { key: 'comparison', label: 'Comparison', href: '/comparison' },
            { key: 'manual', label: 'User Manual', href: '/manualDetail' },
            { key: 'knowledgebase', label: 'Knowledge Base', href: '/knowledgeBase' },
          ]
        },
        { key: 'divider', type: 'divider' },
        { key: 'logout', label: 'Logout', href: '/auth/logout' },
      ]);
    } else {
      setItems([
        { key: 'dataanalytics', label: 'Data Analytics', href: '/intelligent' },
        {
          key: 'datacenter', label: 'Data Center', children: [
            { key: 'specification', label: 'Specification', href: '/specification' },
            { key: 'comparison', label: 'Comparison', href: '/comparison' },
            { key: 'manual', label: 'User Manual', href: '/manualDetail' },
            { key: 'knowledgebase', label: 'Knowledge Base', href: '/knowledgeBase' },
          ]
        },
        { key: 'divider', type: 'divider' },
        { key: 'logout', label: 'Logout', href: '/auth/logout' },
      ]);
    }
  }, [router.pathname, subtype]);

  // ฟังก์ชันจัดการคลิกเมนู
  const handleClick = (e) => {
    const mainKey = e.key;
    let data = [
      { title: "listdataanalytic", href: "/intelligent" }
    ];
    _.map(items, (item) => {
      if (_.includes(e?.keyPath, item.key)) {
        if (item.key === mainKey) {
          setTitle(item.label);
        }
        data.push({
          title: item.label,
          ...(item?.href ? { href: item.href } : {})
        });
      }
      if (item?.children) {
        _.map(item.children, (child) => {
          if (_.includes(e?.keyPath, child.key)) {
            if (child.key === mainKey) {
              setTitle(child.label);
            }
            data.push({
              title: child.label,
              href: child.href
            });
          }
        });
      }
    });

    if (router.query?.subtype) {
      data.push({
        title: router.query?.subtype,
        href: "?subtype=" + router.query?.subtype
      });
    }

    setBc(_.uniqBy(data, "title"));

    // เก็บ URL ที่กดใน recoil เพื่อให้ sidebar รู้ว่าต้องเปิดเมนูอะไร
    if (e?.item?.props?.href) {
      setSelectedUrl(e.item.props.href);
    }

    router.push(e?.item?.props?.href);

    // เปิดเมนู parent ถ้าเป็น submenu
    const parentKey = e.keyPath[e.keyPath.length - 1];
    setOpenKeys([parentKey]);
    setCurrentMenuItem([e.key]);
  };

  // จัดการ open submenu
  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  if (status !== 'authenticated') return null;

  // กรองเมนูตามสิทธิ์ผู้ใช้
  const filteredItems = _.filter(items, item => {
    if (item.children) {
      return _.some(item.children, child => {
        let showchild = mapUrl(child.href, _.split(session?.user?.permissions, ','));
        return showchild;
      });
    }
    if (item?.href) {
      let showit = mapUrl(item.href, _.split(session?.user?.permissions, ','));
      return showit || item.key === 'logout';
    }
    return item.key === 'logout';
  });

  return (
    <Sider width={300} style={{ background: 'rgb(68,114,196)' }} id={'sidebar'}>
      <Menu
        id={'menuside'}
        theme={'dark'}
        mode="inline"
        selectedKeys={currentMenuItem}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        onClick={handleClick}
        items={filteredItems}
        style={{ background: 'rgb(68,114,196)' }}
      />
    </Sider>
  );
};

export default Sidebar;
