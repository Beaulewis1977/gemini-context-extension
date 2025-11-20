import express from 'express';
import { z } from 'zod';

const app = express();
const port = 3000;

// Validation schema
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.post('/users', (req, res) => {
  try {
    const user = UserSchema.parse(req.body);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
