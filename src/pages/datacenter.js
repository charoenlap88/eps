import React, { useEffect, useState } from "react";
import { Card, message, Row, Col, Button, Typography } from "antd";
import { withAuth } from "../utils/middleware.js";
import { apiClient } from "../utils/apiClient.js";
const { Meta } = Card;
import { selectModelState } from "@/store/data";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router.js";
import _ from 'lodash';
import { getSession, useSession } from "next-auth/react";

const Datacenter = () => {
    const { data: session, status } = useSession();
	const [selectModel,setSelectModel] = useRecoilState(selectModelState);
	const router = useRouter();
    const [lists, setLists] = useState([]);

    const getLists = async () => {
        message.loading({key:'init',content:'loading...'})
        let models = await apiClient().get('/model');
		if (_.some(_.split(session?.user?.permissions, ','), f => _.startsWith(f, 'model:'))) {
			let permissionModel = _.map(_.filter(_.split(session?.user?.permissions, ','), f => _.startsWith(f, 'model:')), v => _.toLower(_.last(_.split(v, ':'))));
			console.log('Found Permission Model', permissionModel);
			// console.log(_.filter(models.data, f => _.includes(permissionModel, _.toLower(f.model_name))))
			let modelOnlyPermission = _.filter(models.data, f => _.includes(permissionModel, _.toLower(f.model_name)));
			models.data = modelOnlyPermission
			if (modelOnlyPermission) {
				console.error('Permission Model Not Match', permissionModel)
			}
		}
        setLists(models.data)
        if (_.size(models?.data)>0) {
            message.success({key:'init',content:'Load model success'})
        } else {
            message.error({key:'inti',content:'Cannot load model'});
        }
    }

    useEffect(() => {
        (async()=>{
            if (_.size(lists)==0 && session) {
                await getLists();
            }
        })()
    }, [lists, session])

	return (
		<>
			<Card>
				<Row justify="center" gutter={[14,14]}>
				{
					_.size(lists)>0 && _.map(lists, val => (
						<Col span={6} lg={6} md={8} xs={12}>
							<Button type="link" onClick={()=>{
								setSelectModel(val);
								router.push('/specification')
							}} style={{width:'100%',padding:0}}>
								<Card cover={<img alt={val.id} src={"images/m"+val.id+".png"} />} style={{margin: '5px'}} bodyStyle={{padding:'0'}}>
									{/* <Meta title={val.model_name} /> */}
									<Typography.Paragraph style={{fontWeight:'bold', maxWidth:'100%', whiteSpace:'break-spaces', textAlign: 'center'}}>{val.model_name}</Typography.Paragraph>
								</Card>
							</Button>
						</Col>
					))
				}
				</Row>
			</Card>
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

export default withAuth(Datacenter);