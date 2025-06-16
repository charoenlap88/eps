import React, { useState, useEffect } from "react";
import {
	Breadcrumb,
	Card,
	Space,
	Col,
	Divider,
	Row,
	AutoComplete,
	Input,
	message,
	Form,
	Select
} from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { apiClient } from "../utils/apiClient";
import { useRouter } from "next/router";
import _ from "lodash";
import MyModel from "@/components/myModel";
import { useRecoilState } from "recoil";
import { modelsState, selectModelState } from "@/store/data";
import Link from "next/link";
import { withAuth } from "@/utils/middleware";
import { getSession } from "next-auth/react";
const { Meta } = Card;

const KnowledgeBase = () => {
	const [form] = Form.useForm();
	const [options, setOptions] = useState([]);
    const [optionSeries, setOptionSeries] = useState([])
	const router = useRouter();
	const [nowModel, setNowModel] = useRecoilState(selectModelState);
	const [files, setFiles] = useState([]);
	
    const filterOption = (input, option) => {
        let inputLow = _.join(_.split(_.lowerCase(input),' '),'');
        let labelLow = _.join(_.split(_.lowerCase(option?.label),' '),'');
        return _.startsWith(labelLow, inputLow) || inputLow==labelLow || labelLow.indexOf(inputLow) !== -1
    }

	const onValuesChange = async (change, all) => {
		console.log(change)
		if (change?.series) {
			await getListSeries(false,true,change.series)
		}
	}

	const getListSeries = async (saveOption=true, listFile=false, thisSeries=undefined) => {
		try {
			let params = {
				type: process.env.NEXT_PUBLIC_KNOWLEDGE,
				model: nowModel?.folder,
				// series: series
			}
			console.log('params',params);
			if (thisSeries) {
				params.series = thisSeries
			}
			let result = await apiClient().get('/file/list', {params})
			if (saveOption) {
				let temp = _.map(result?.data, val => {
					let text = _.split(val, '_');
					let thisVal = _.head(text);
					return {label:thisVal, value:thisVal}
					// if (!_.isUndefined(_.find(temp, {label:thisVal}))) {
					// 	let index = _.findIndex(temp, {label:thisVal});
					// 	console.log('has', index)
					// 	_.update(temp, '[0].value', value => [...value, val])
					// } else {
					// 	temp.push({label: thisVal, value: [val]});
					// }
					
				})
				temp = _.uniqBy(temp, 'label')
				temp = _.orderBy(temp, 'label', 'asc')
				setOptionSeries(temp)
			}
			if (listFile) {
				setFiles(result?.data);
			}
			console.log(result)
		} catch (e) {
			message.error('Cannot read this folder '+nowModel?.model_name+' '+nowModel?.folder+', Please contact.', 5)
		}
	}

	useEffect(() => {
		(async()=>{
			if (nowModel) {
				console.log('nowModel',nowModel)
				await getListSeries(true, false);
			}
		})()
	}, [nowModel])
	

	return (
		<>
      <Row justify="center">
		<Col span={24}>
			<MyModel />
		</Col>
        <Col span={24}>
          <p>
            <b>Model</b>
          </p>
          
			<Form form={form} onValuesChange={onValuesChange}>
				<Form.Item name={"series"} style={{margin:0}}>
					<Select
						filterOption={filterOption}
						options={optionSeries}
						placeholder="Search Model"
						showSearch
						allowClear
						style={{ width: "100%" }}
					/>
				</Form.Item>
			</Form>
        </Col>
        <Col span={24}>
          <p>
            <b>Items</b>
          </p>
          {_.size(files) > 0 && _.map(files, f => {
			let manual_parts = `pdf/${process.env.NEXT_PUBLIC_KNOWLEDGE}/${nowModel?.folder}/`;
			let manual_filename = f;
			return <p><Link href={`/api/download?file=${encodeURIComponent(manual_filename)}&path=${encodeURIComponent(_.join(_.split(manual_parts, '/'), ','))}`} target="_blank">{f}</Link></p>
		  }
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

export default withAuth(KnowledgeBase)