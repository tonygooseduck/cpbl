// https keys and certificate
const fs = require('fs');

module.exports = {
  privateKey: fs.readFileSync('/etc/letsencrypt/live/www.tonygooseduck.com/privkey.pem', 'utf8'),
  certificate: fs.readFileSync('/etc/letsencrypt/live/www.tonygooseduck.com/cert.pem', 'utf8'),
  chain: fs.readFileSync('/etc/letsencrypt/live/www.tonygooseduck.com/chain.pem', 'utf8'),
};
