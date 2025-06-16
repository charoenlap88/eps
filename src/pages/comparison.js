import React, {useState,useEffect} from 'react';
import {useRecoilState} from 'recoil';
import{  Col, Card, Button, Row,Dropdown,Breadcrumb,Menu,Layout,theme, message, Select, Form, Table, Space  } from 'antd';
import { LaptopOutlined,DownOutlined,HomeOutlined ,UserOutlined   } from '@ant-design/icons';
import _ from 'lodash';
import { apiClient } from '@/utils/apiClient';
import { useRouter } from 'next/router';
import MyModel from "@/components/myModel";
import { selectModelState } from '@/store/data';
import Link from 'next/link';
import { withAuth } from '@/utils/middleware';
import { getSession } from 'next-auth/react';
const { Content,Sider  } = Layout;
const { Meta } = Card;
function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }
const items = [
    {
      key: '1',
      label: (
        <Link target="_blank" rel="#" href="#">
          Model
        </Link>
      ),
    },
  ];
  const items2 = [
    getItem(
        <Link href="/specification">Specification</Link>,
        'specification',
        <UserOutlined />,
      ),
      getItem(
        <Link href="/comparison">Comparison</Link>,
        'comparison',
        <LaptopOutlined />,
      ),
  ];
const Comparison = () => {
    
    const [selectModel,setSelectModel] = useRecoilState(selectModelState);
    const router = useRouter();
    const [series, setSeries] = useState([]);
    const [optionSeries, setOptionSeries] = useState([])
    const [optionSeriesRemaining, setOptionSeriesRemaining] = useState([])
    const [form] = Form.useForm();
    const [selectedSeries, setSelectedSeries] = useState({
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
    });
    const [keySelect, setKeySelect] = useState(0);
    const [dataSource, setDataSource] = useState([])

    const renderSelect = () => <Select 
                                    filterOption={filterOption}
                                    options={optionSeriesRemaining} 
                                    placeholder="Model" 
                                    showSearch 
                                    style={{width:'100%'}} />
    
    const filterOption = (input, option) => {
        let inputLow = _.join(_.split(_.lowerCase(input),' '),'');
        let labelLow = _.join(_.split(_.lowerCase(option?.label),' '),'');
        return _.startsWith(labelLow, inputLow) ||inputLow==labelLow
    }
    const defaultTableColumn = [
        {
            title:'',
            dataIndex:'head',
            key:'head',
            rowScope: 'row',
        },
        {
            title: (
                <Form.Item name={['series','1']}>
                    {renderSelect()}
                </Form.Item>
            ),
            dataIndex:'compare1',
            key: 'compare1'
        },
        // {
        //     title: (
        //         <Form.Item name={['series','2']}>
        //             {renderSelect()}
        //         </Form.Item>
        //     ),
        //     dataIndex:'compare2',
        //     key: 'compare2'
        // },
        // {
        //     title: (
        //         <Form.Item name={['series','3']}>
        //             {renderSelect()}
        //         </Form.Item>
        //     ),
        //     dataIndex:'compare3',
        //     key: 'compare3'
        // },
    ]
    const [tableColumn, setTableColumn] = useState(defaultTableColumn)

    const removeColumn = (index) => {
        let column = _.cloneDeep(tableColumn);
        delete column[index];
        let newColumn = column;
        setTableColumn(newColumn)
    }

    const getSeries = async() => {
        message.loading({key:'series',content:'loading series...'});
        // let resultModel = await apiClient().get('/model');
        // let resultSeries = await apiClient().get('/series',{params:{id_model: selectModel.id}}).catch(e => message.error({key:'series',content:'error series'}));
        let resultSeries = await apiClient().get('/value',{params:{table: selectModel?.table_compair}}).catch(e => {
            console.log(e);
            message.error({key:'series',content:'error content series'})
        });
        if (_.size(resultSeries?.data)>0) {
            setSeries(resultSeries.data)
            setOptionSeries(_.map(resultSeries.data, v => ({label:v[1],value:v?.id})))
            setOptionSeriesRemaining(_.map(resultSeries.data, v => ({label:v[1],value:v?.id})))
            setSelectedSeries([])
            
            message.success({key:'series',content:'load series succes'})
        }
    }

    const getColumn = async () => {
        message.loading({key:'column',content:'loading column...'});
        let cols = await apiClient().get('/column',{params:{id_model: selectModel.id}}).catch(e => message.error({key:'column',content:'error content getcolumn'}));
        if (_.size(cols?.data)>0) {
            setDataSource(_.map(cols.data, (v,i) => ({
                key:v.id,
                keyCol: ++i,
                head: v.column_name,
                compare1: '',
                compare2: '',
                compare3: '',
            })))
            message.success({key:'column',content:'load column success'})
        }
    }

    const getValue = async(key,idseries) => {
        message.loading({key:'series',content:'loading series...'});
        if (!selectModel?.table_compair) {
            message.error({key:'series',content:'Table not found'})
        }
        let result = await apiClient().get('/value',{params:{id: idseries, table: selectModel?.table_compair}}).catch(e => message.error({key:'series',content:'error content'}));
        if (_.size(result?.data)>0) {
            setDataSource(_.map(dataSource, v => {
                return {
                    ...v,
                    ['compare'+key]: _.find(result.data[0], (val,index) => index==v.keyCol)
                }
            }))
            message.success({key:'series',content:'load series success'})
        }
    }

    const onValuesChange = async(change,all) => {
        if (change?.series) {
            let k = _.head(_.keys(change.series))
            let v = _.head(_.values(change.series))
            await getValue(k, v);
            setSelectedSeries({
                ...selectedSeries,
                ...change?.series
            })
        }
    }

    useEffect(() => {
        setOptionSeriesRemaining(_.filter(optionSeries, f => !_.includes(_.values(selectedSeries), f.value)));
    }, [selectedSeries])
    

    // useEffect(()=>{
    //     console.log('selectedSeries',selectedSeries)
    //     console.log('optionSeries',optionSeries)
    //     console.log('optionSeriesRemaining',optionSeriesRemaining)
    // },[selectedSeries, optionSeries, optionSeriesRemaining])

    const addColumn = () => {
        let index = parseInt(_.size(tableColumn));
        let tabletemp = _.cloneDeep(tableColumn);
        let temp = tabletemp[1];
        temp.dataIndex = 'compare'+index;
        temp.key = 'compare'+index;
        temp.title = (
            <Form.Item name={['series',(index)+'']}>
                <Select 
                    filterOption={filterOption}
                    options={optionSeriesRemaining} 
                    placeholder="Model" 
                    showSearch 
                    style={{width:'100%'}} />
            </Form.Item>
        )
        console.log('check',index+'', temp)
        setTableColumn([
            ...tableColumn,
            temp
        ])
    }

    const resetAll = async () => {
        await getSeries();
        await getColumn();
        setKeySelect(1);
        form.resetFields();
    }

    useEffect(() => {
        if (optionSeries) {
            setTableColumn(defaultTableColumn);
        }
    }, [optionSeries])
    
    useEffect(() => {
        (async()=>{
            if (selectModel) {
                // form.resetFields();
                await getSeries();
                await getColumn();
            }
        })()
    }, [selectModel])
    
    
  return (
    <>
        <Row style={{marginBottom:'5px'}}>
            <Col span={12}>
                <MyModel />
            </Col>
            <Col span={12} style={{textAlign:'right'}}>
                <Space>
                    <Button danger onClick={async()=>await resetAll()}>Reset</Button>
                    <Button type="primary" disabled={_.size(tableColumn)>=6} onClick={()=>addColumn()}>Add Column</Button>
                </Space>
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                <Form form={form} onValuesChange={onValuesChange}>
                    {
                        optionSeriesRemaining && <Table bordered dataSource={dataSource} columns={tableColumn} pagination={{pageSize: _.size(dataSource), hideOnSinglePage:true}} />
                    }
                </Form>
            </Col>
        </Row>
    </>
  )
}

export async function getServerSideProps(context) {
    context.res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	 const session = await getSession(context);
	if (session==null) {
		return { redirect: { destination: '/auth/login?authen', permanent: false } }
	}
	return {props:{}}
}

export default withAuth(Comparison)