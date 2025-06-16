import React, {useState,useEffect,useContext} from "react";
import {useRecoilState} from 'recoil';
import Link from 'next/link';
import { useRouter } from "next/router";
import { Card, Space,Col, Row, Breadcrumb, message,Button } from "antd";
import {
	HomeOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { apiClient } from '../utils/apiClient';
import _ from 'lodash';
import MyModel from "@/components/myModel";
import { selectModelState } from "@/store/data";
import { withAuth } from "@/utils/middleware";

const { Meta } = Card;

const Specandcompair = () =>  {
	const [selectModel,setSelectModel] = useRecoilState(selectModelState);
	const router = useRouter();
    const [lists, setLists] = useState([]);

    const getLists = async () => {
        message.loading({key:'init',content:'loading...'})
        const models = await apiClient().get('/model');
        console.log(models);
        setLists(models.data)
        if (_.size(models?.data)>0) {
            message.success({key:'init',content:'Load model success'})
        } else {
            message.error({key:'inti',content:'Cannot load model'});
        }
    }

    useEffect(() => {
        (async()=>{
            if (_.size(lists)==0) {
                await getLists();
            }
        })()
    }, [lists])

	return (
		<>
			{/* <MyModel /> */}
			<Card>
				<Row justify="center">
				{
					_.size(lists)>0 && _.map(lists, val => (
						<Col span={8} >
							<Button type="link" onClick={()=>{
								setSelectModel(val);
								// modal.destroy();
								// setIsModalOpen(false);
								// router.push('/specification')
							}} style={{width:'100%'}}>
								<Card cover={<img alt={val.id} src={"images/m"+val.id+".png"} />}>
									<Meta title={val.model_name} />
								</Card>
							</Button>
						</Col>
					))
				}
				</Row>
			</Card>
		</>
	);
};

export async function getServerSideProps(context) {
    context.res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	 const session = await getSession(context);
	if (session==null) {
		return { redirect: { destination: '/auth/login?authen', permanent: false } }
	}
	return {props:{}}
}

export default withAuth(Specandcompair);