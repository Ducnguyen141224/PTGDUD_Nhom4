export default function handler(_req, res) {
  res.status(200).json({
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    nodeEnv: process.env.NODE_ENV || "",
    vercelEnv: process.env.VERCEL_ENV || "",
  });
}
