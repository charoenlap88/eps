import React, { useState, useEffect } from "react";
import { Layout, theme } from "antd";
import HeaderMenu from "./headermenu";
import Sidebar from "./sidebar";
import Breadcrumbs from "./breadcrumbs";
import { useRouter } from "next/router";
const { Content } = Layout;

const DefaultLayout = ({ children }) => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();
	const router = useRouter();
	const [isAuth, setIsAuth] = useState(false);
	const checkPathAuth = () => {
		if (_.includes(_.split(router.pathname, "/"), "auth")) {
			setIsAuth(false);
		} else {
			setIsAuth(true);
		}
	};

	useEffect(() => {
		checkPathAuth();
	}, [router]);
	return (
		<Layout>
			<HeaderMenu />
			<Layout>
				{isAuth && <Sidebar />}
				<Layout
					style={{
						padding: "0 24px 24px",
					}}
				>
					{isAuth && <Breadcrumbs />}
					<Content
						style={{
							...(isAuth
								? {
										padding: 24,
										margin: 0,
										minHeight: "calc(100vh - 142px)",
										background: colorBgContainer,
								  }
								: {}),
						}}
					>
						{children}
					</Content>
				</Layout>
			</Layout>
		</Layout>
	);
};

export default DefaultLayout;
