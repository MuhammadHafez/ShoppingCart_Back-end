var jwt = require('jsonwebtoken');
const JWT_SECRET = 'this is JWT Secret for Application...';

function generateToken(id, email) {
    let Token = jwt.sign({ id: id, email: email }, JWT_SECRET);
    return Token;
}


function isSignIn(req, res, next) {
    let Token = req.header('Authorization');
    try {
        let data = jwt.verify(Token, JWT_SECRET);
        next(data);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
function isAdmin(req, res, next) {
    let Token = req.header('Authorization');
    try {
        let data = jwt.verify(Token, JWT_SECRET);
        next();
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
module.exports = {
    generateToken: generateToken,
    isSignIn: isSignIn,
    isAdmin:isAdmin
}