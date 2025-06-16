import { downloadFile } from '../../components/download';


export default function handler(req, res) {
  if (req.method === 'GET') {
    downloadFile(req, res);
    
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
