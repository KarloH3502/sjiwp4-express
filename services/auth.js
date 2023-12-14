const JWT_SECRET_KEY ="jsv9vR6WxdWVEhhrWjdGtHykhO9ZjjZucvqyS8Qz2Sm3bretlfQcvqdth1wXuXVB9vmVpOUwvB68ylFpMrjcgwXyX31xSpJaw8rEvUbExUbmPS1ymZh2aQtx3oOtKUGW";

const jwt = require("jsonwebtoken");

function getUserJwt(id, email, name, role, expDays = 7) {
    const tokenData = {
    uid:id,
    email: email,
    name: name, 
    role: role,
    time: Date.now
};

const tokenOptions = {
    expiresIn: expDays * 24 * 60 * 60
};

const token = jwt.sign(tokenData, JWT_SECRET_KEY, tokenOptions);

return token;
}
//MIDDLEWARE FOR AUTH COOKIE CHECK
function checkAuthCookie(req, res, next) {
    const token = req.cookies["auth"];
    console.log("COOKIE CHECK", token);

    const result = jwt.verify(token, JWT_SECRET_KEY);
    console.log("TOKEN CHECK", result);
}

module.exports = {
    getUserJwt,
    checkAuthCookie
};