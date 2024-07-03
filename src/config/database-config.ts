import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const uri = process.env.MONGODB_URI
  return {
    uri,
  };
});
