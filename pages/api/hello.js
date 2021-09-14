// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function helloAPI(req, res) {
  const locale = req.headers["accept-language"] || "en";

  res.status(200).json({ name: `John Doe ${locale}` });
}
