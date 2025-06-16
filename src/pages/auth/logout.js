import React, { useEffect } from 'react'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router';

const Logout = () => {
  const {data:session, status} = useSession();
  const router = useRouter();

  console.log(status);
  if (status=='authenticated') {
    signOut({ callbackUrl: '/auth/login' });
  } else if (status=='unauthenticated') {
    router.push('/auth/login');
  }
  
  return (
    <div></div>
  )
}

export default Logout