import { modelsState, selectModelState } from '@/store/data'
import {FormOutlined} from "@ant-design/icons";
import { Form, Card, Button, Modal, Row, Col, Typography } from 'antd'
import {useRecoilState} from 'recoil';
import React, { useEffect, useState } from 'react'
import { apiClient } from '../utils/apiClient';
import _ from 'lodash';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
const {Meta} = Card;

const MyModel = () => {
    const { data: session, status } = useSession();
    const [models,setModels] = useRecoilState(modelsState);
    const [selectModel, setSelectModel] = useRecoilState(selectModelState)
    const [lists, setLists] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    
    const getLists = async () => {
        let results = await apiClient().get('/model');
        if (_.some(_.split(session?.user?.permissions, ','), f => _.startsWith(f, 'model:'))) {
			let permissionModel = _.map(_.filter(_.split(session?.user?.permissions, ','), f => _.startsWith(f, 'model:')), v => _.toLower(_.last(_.split(v, ':'))));
			console.log('Found Permission Model', permissionModel);
			// console.log(_.filter(models.data, f => _.includes(permissionModel, _.toLower(f.model_name))))
			let modelOnlyPermission = _.filter(results.data, f => _.includes(permissionModel, _.toLower(f.model_name)));
			results.data = modelOnlyPermission
			if (modelOnlyPermission) {
				console.error('Permission Model Not Match', permissionModel)
			}
		}
        console.log(results.data)
        setModels(results.data)
        setLists(results.data)
    }

    useEffect(() => {
        (async()=>{
            if (_.size(lists)==0 && session) {
                await getLists();
            }
        })()
    }, [lists, session])
    
    useEffect(() => {
        console.log(models, selectModel)
        if (_.isEmpty(selectModel)) {
            setIsModalOpen(true);
        }
    }, [selectModel, models])

    
    

  return (
    
    <div style={{marginBottom:'5px'}}>
        <Button onClick={()=>setIsModalOpen(!isModalOpen)}><FormOutlined />{_.result(_.find(models, {id:selectModel?.id}),'model_name') || 'Please select type' }</Button>
        <Modal title="Please select type" open={isModalOpen} width={'50%'} footer={null} destroyOnClose={true} onCancel={()=>setIsModalOpen(false)}>
            <Row gutter={[24,24]} justify={'center'}>
            {
                _.map(models, val => (
                    <Col span={6} lg={6} md={8} xs={12}>
                        <Button type="link" onClick={()=>{
                            setSelectModel(val);
                            // modal.destroy();
                            setIsModalOpen(false);
                            // router.push('/specification')
                        }} style={{width:'100%',padding:0}}>
                            <Card cover={<img alt={val.id} src={"images/m"+val.id+".png"} bodyStyle={{padding:'0'}}/>}>
                                {/* <Meta title={val.model_name} style={{fontWeight:'bold', maxWidth:'100%', whiteSpace:'break-spaces', textAlign: 'center'}} /> */}
                                <Typography.Paragraph style={{fontWeight:'bold', margin:0, maxWidth:'100%', whiteSpace:'break-spaces', textAlign: 'center'}}>{val.model_name}</Typography.Paragraph>
                            </Card>
                        </Button>
                    </Col>
                ))
            }
            </Row>
        </Modal>
        {/* <Form initialValues={{modelid: selectModel?.id}}>
            <Form.Item label="Type" name="modelid">
                <Select options={_.map(lists, v => ({ label: v.model_name, value: v.id }))} onSelect={(val)=>{
                    console.log('setselect',_.find(model, {id: val}))
                    setSelectModel(_.find(model, {id: val}))
                }} style={{width: '200px'}} />
            </Form.Item>
        </Form> */}
    </div>
  )
}

export default MyModel