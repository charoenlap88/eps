import { connectDb } from '../../utils/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: 'public/upload/projector',
  filename: function (req, file, cb) {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await new Promise((resolve, reject) => {
        upload.single('file')(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      if (!req.file) {
        throw new Error('No file uploaded.');
      }
      const { filename } = req.file;
      const filePath = path.join('public/upload/projector', filename);
      res.status(200).json({ status:'success',filePath:filePath });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error reading the file.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
