import React from "react";
import { Drawer } from "antd";
import { useResetRecoilState, useRecoilValue } from "recoil";
import { drawerOpenState, drawerTitleState, drawerContentState, drawerWidthState, closeDrawerState } from "@/store/drawer";

const DefaultDrawer = () => {
	const open = useRecoilValue(drawerOpenState);
    const title = useRecoilValue(drawerTitleState);
    const content = useRecoilValue(drawerContentState);
    const width = useRecoilValue(drawerWidthState);
    const closeDrawer = useResetRecoilState(closeDrawerState)

    const onClose = () => {
        closeDrawer();
    }

	return (
		<Drawer
			title={title}
			placement="right"
			onClose={onClose}
			open={open}
            width={width}
		>
            {content}
        </Drawer>
	);
};

export default DefaultDrawer;
