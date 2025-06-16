import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSession } from "next-auth/react";

const s3Client = new S3Client({
  region: "ap-southeast-2", // ใช้ Region ของ S3 Bucket (ของคุณคือ Sydney)
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function downloadFile(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send("Unauthorized");
  }

  const { file, path: filePath } = req.query;
  if (!file || !filePath) {
    return res.status(400).send("Missing file or path parameter");
  }

  const bucketName = "epson-th"; // ใส่ชื่อ S3 Bucket ของคุณ
  const s3Key = `${filePath.replace(/,/g, "/")}/${file}`.replace(/\/{2,}/g, "/"); // แปลง path เป็น key ใน S3

  console.log("S3 Key:", s3Key);

  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
    const { Body } = await s3Client.send(command);

    res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(file)}`);
    res.setHeader("Content-Type", "application/octet-stream");

    Body.pipe(res); // ส่งไฟล์ให้ client ดาวน์โหลด
  } catch (error) {
    console.error("S3 Download Error:", error);
    res.status(500).send("Failed to download file from S3 file:"+file+" filePath:"+filePath);
  }
}
