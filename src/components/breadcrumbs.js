import React, { useEffect, useState } from 'react'
import {useRecoilState} from 'recoil';
import { Breadcrumb } from 'antd'
import { breadcrumbState } from '@/store/page';
import _ from 'lodash';
import { useSession } from 'next-auth/react';

const Breadcrumbs = () => {
    const {data:session, status} = useSession();
    const [bc,setBc] = useRecoilState(breadcrumbState);
    const [items, setItems] = useState([]);
    useEffect(() => {
        setItems(bc)
    }, [bc])
    
        
  if (status=='authenticated') {
    return (
      <Breadcrumb style={{margin: "16px 0", }} items={items} />
    )
  }
}

export default Breadcrumbs