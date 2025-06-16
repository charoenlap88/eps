import { models2State, selectModel2State } from '@/store/data'
import {FormOutlined} from "@ant-design/icons";
import { Form, Card, Button, Modal, Row, Col, Collapse, Divider, Image, Select } from 'antd'
import {useRecoilState} from 'recoil';
import React, { useEffect, useState } from 'react'
import { apiClient } from '../utils/apiClient';
import _ from 'lodash';
import { useRouter } from 'next/router';
import axios from 'axios'
const {Meta} = Card;

const MyModel2 = () => {
    const [models2,setModels2] = useRecoilState(models2State);
    const [selectModel2, setSelectModel2] = useRecoilState(selectModel2State)
    const [lists, setLists] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [options, setOptions] = useState()
    const [types, setTypes] = useState([
        {key: 'lfp', name: 'LFP'},
        {key: 'projector', name: 'Projector / Others'}
    ])
    const [subTypes, setSubTypes] = useState([])
    const router = useRouter();
    
    const getLists = async () => {
        const results = await axios.get('/api/manual/listModelSC');
        console.log(results.data)
        console.log(_.groupBy(results.data, 'subtype'))
        // setSubTypes({
        //     lfp: _.groupBy(_.filter(results.data, {type:'LFP'}), 'subtype'),
        //     projector: _.groupBy(_.filter(results.data, f => f.type!='LFP'), 'subtype'),
        // })
        console.log(_.map(_.groupBy(results.data, 'subtype'), (arr,key) => ({
            label: key,
            options: _.map(arr, v => ({ label: v.model_name, value: v.id }))
        })))
        setModels2(results.data)
        setLists(_.map(_.groupBy(results.data, 'subtype'), (arr,key) => ({
            label: key,
            options: _.map(arr, v => ({ label: v.model_name, value: v.id }))
        })))
    }

    useEffect(() => {
        (async()=>{
            if (_.size(lists)==0) {
                await getLists();
            }
        })()
    }, [])
    
    useEffect(() => {
        // console.log(models2, selectModel2)
        if (_.isEmpty(selectModel2)) {
            setIsModalOpen(true);
        }
    }, [selectModel2, models2])

  return (
    <div style={{marginBottom:'5px'}}>
        <Button onClick={()=>setIsModalOpen(!isModalOpen)}><FormOutlined />{_.result(_.find(models2, {id:selectModel2?.id}),'model_name') || 'Please select type' }</Button>
        <Modal title="Please select type" open={isModalOpen} width={'50%'} footer={null} destroyOnClose={true} onCancel={()=>setIsModalOpen(false)}>
            <Select onChange={(value,option) => {
                console.log(_.find(models2, {id:value}))
                setSelectModel2(_.find(models2, {id:value}));
                setIsModalOpen(false);
            }} defaultValue={selectModel2?.id} placeholder="Please select model" showSearch={true} filterOption={(input,option) => _.includes(_.lowerCase(option.label), _.lowerCase(input))} options={lists} style={{width:'100%'}} />
            {/* <Collapse defaultActiveKey={['lfp','projector']}>
                {
                    _.map(types, type => (
                        <Collapse.Panel header={type.name} key={type.key}>
                            <Row gutter={[12,12]}>
                            {_.map(_.find(subTypes, (v,k) => k==type.key), (sub,title) => (
                                // <Divider orientation="left">{title}</Divider>
                                <Col span={6} style={{textAlign:'center'}}>
                                    {JSON.stringify(type)}
                                    <Card onClick={()=>setSelectModel2()}>
                                        <Image src={"images/"+title+'.png'} alt={title+'.png'} preview={false} />
                                        <p>{title}</p>
                                    </Card>
                                </Col>

                            ))}
                            </Row>
                        </Collapse.Panel>
                    ))
                }
            </Collapse> */}
            {/* <Row gutter={[24,24]} justify={'center'}>
            {
                _.map(models, val => (
                    <Col span={8} >
                        <Button type="link" onClick={()=>{
                            setSelectModel(val);
                            // modal.destroy();
                            setIsModalOpen(false);
                            // router.push('/specification')
                        }} style={{width:'100%'}}>
                            <Card cover={<img alt={val.id} src={"images/m"+val.id+".png"} style={{height:'120px'}} />}>
                                <Meta title={val.model_name} />
                            </Card>
                        </Button>
                    </Col>
                ))
            }
            </Row> */}
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

export default MyModel2