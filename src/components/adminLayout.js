import { Layout, Image, Menu, theme } from "antd";
import React from "react";
import { useRouter } from "next/router";
import DefaultDrawer from "./defaultDrawer";
import { useSession } from "next-auth/react";
import { mapUrl } from "@/utils/tools";
const { Header, Sider, Content } = Layout;
import _ from 'lodash';

const AdminLayout = ({ children }) => {
	const { data: session, status } = useSession()
    const {
		token: { colorBgContainer },
	} = theme.useToken();
	const router = useRouter();
	const handleClick = (e) => {
		router.push(e?.item?.props?.href);
	};
	if (status=='loading') {
		<Layout>
			Loading
		</Layout>
	}
	if (status=='authenticated') {
		return (
			<Layout>
				<Header
					style={{
						display: "flex",
						alignItems: "center",
						padding: "0 30px",
						background: "#231f20",
						color: "#fff",
					}}
				>
					<Image
						alt="example"
						preview={false}
						src="../../../images/logo.png"
						width={100}
					/>
				</Header>
				<Layout>
					<Sider
						width={300}
						style={{ background: "rgb(68,114,196)" }}
						id={"sidebar"}
					>
						<Menu
							id={"menuside"}
							theme={"dark"}
							mode="inline"
							defaultSelectedKeys={["home"]}
							defaultOpenKeys={["datacenter", "dataanalytics"]}
							items={_.filter([
								{ key: "user", label: "User", href: "/admin/user" },
								{ key: "role", label: "Role", href: "/admin/role" },
								{
									key: "permission",
									label: "Permission",
									href: "/admin/permission",
								},
								{ key: "dump", label: "Manage Table", href: "/admin/dump" },
								{ key: "dump", label: "Report Login", href: "/admin/reportLogin" },
								{ key: "out", label: "Logout", href: "/admin/logout" },
							], find => mapUrl(find.href, _.split(session?.user?.permissions,',')) || find.key=='out')}
							onClick={handleClick}
							style={{ background: "rgb(68,114,196)" }}
						/>
					</Sider>
					<Content 
						style={{
							padding: 24,
							margin: 0,
							minHeight: "calc(100vh - 64px)",
							background: colorBgContainer,
						}}>
						{children}
						<DefaultDrawer />
					</Content>
				</Layout>
			</Layout>
		);
	}
};

export default AdminLayout;
