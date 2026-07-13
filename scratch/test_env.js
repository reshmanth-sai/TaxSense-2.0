import dotenv from 'dotenv';
dotenv.config();
console.log('Environment variables present:');
for (const key of Object.keys(process.env)) {
  console.log(`- ${key}: ${process.env[key] ? 'PRESENT' : 'EMPTY'}`);
}
