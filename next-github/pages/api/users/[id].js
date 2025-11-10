import dbConnect from '@/database/mongodb';
import User from '@/models/user';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json(user);
  }

  if (req.method === 'DELETE') {
    await User.findByIdAndDelete(id);
    return res.status(204).end();
  }

  res.status(405).end();
}
