const jwt = require('jsonwebtoken');

// Verify JWT from Authorization header and attach req.user
// Viva: token check — we verify signature + expiry, reject with 401 on failure
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No session found. Please log in.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, handle, niche }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

module.exports = authMiddleware;
