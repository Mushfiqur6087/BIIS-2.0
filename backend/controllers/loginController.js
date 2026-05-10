const users  = require('../Database/userLoginInformation');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

async function getUserByID(username) {
  const allUsers = await users.getUserInformation();
  return allUsers.filter(u => String(u.USER_ID) === String(username));
}

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });

  const foundUser = await getUserByID(username);
  if (!foundUser.length)
    return res.status(404).json({ message: 'User not found.' });

  const match = await bcrypt.compare(String(password), foundUser[0].PASSWORD);
  if (!match)
    return res.status(403).json({ message: 'Wrong password.' });

  const role = foundUser[0].ROLE;
  const token = jwt.sign({ userID: username, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.cookie('accesstoken', token, {
    maxAge: 3600000,
    httpOnly: true,
    sameSite: 'lax',   // allow cross-site cookie in dev
  });

  return res.json({ role, userID: username });
};

module.exports = { handleLogin };
