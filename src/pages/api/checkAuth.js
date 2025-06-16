// pages/api/checkAuth.js
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized access. Please log in.' });
  }

  // Allow access if the user is authenticated
  return res.status(200).json({ message: 'Access granted' });
}
