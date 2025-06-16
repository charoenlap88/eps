import { withAuth } from '@/utils/middleware';
import { getSession } from 'next-auth/react';
import React from 'react'
import _ from 'lodash';

const Landing = () => {
  return (
    <div></div>
  )
}


export async function getServerSideProps(context) {
    context.res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	 const session = await getSession(context);
     
    const roleIds = session?.user?.permissions.split(',');
    if (session?.user?.permissions=='*' || _.includes(roleIds, '/intelligent')){
        return { redirect: { destination: '/intelligent', permanent: false } }
    } else if (_.includes(roleIds, '/specification')) {
        return { redirect: { destination: '/specification', permanent: false } }
    }
	if (session==null) {
		return { redirect: { destination: '/auth/login?authen', permanent: false } }
	}
	return {props:{}}
}

export default withAuth(Landing)