import { encode, decode } from '../../../utils/encryption';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// 🔹 Setup S3 Client
const s3Client = new S3Client({
  region: "ap-southeast-2", // Replace with your AWS S3 region
  credentials: {
    accessKeyId: 'AKIATOFZGHSDLMOVUEIS',
    secretAccessKey: 'QoyqnNl6mEWwy9v/Hs3T/UxE53KRye+XgH67cCz+',
  },
});

const BUCKET_NAME = "epson-th"; // Change to your S3 bucket name

export default async function handler(req, res) {
    try {
        const { method, data, params } = decode(req.body);

        if (method === 'get') {
            if (!params?.type || !params?.model) {
                return res.status(400).json({ error: "Missing required parameters (type, model)" });
            }

            // 🔹 Define S3 Path
            const prefix = `pdf/${params.type}/${params.model}/`; // S3 folder path
            console.log("Fetching files from S3 path:", prefix);

            // 🔹 Fetch Files from S3
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: prefix,
            });
            const response = await s3Client.send(command);

            let files = response.Contents?.map(file => file.Key.replace(prefix, "")) || [];

            // 🔹 Filter by series if provided
            if (params?.series) {
                files = files.filter(f => f.startsWith(params.series));
            }

            console.log('Fetched files:', files);
            res.status(200).json({ data: encode(files) });

        } else {
            res.status(405).send('Method not allowed');
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error?.message });
    }
}
