const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Generated hash for password:', password);
  console.log('Hash:', hash);
}

generateHash().catch(console.error);
