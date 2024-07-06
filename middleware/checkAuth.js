const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY || 'asdfghjkl1234567890asdfghjk';

module.exports = async (req, res, next) => {
    try {

        const token = req.headers.Authorization || req.headers.authorization;

        const jwtData = {
            expiresIn: process.env.EXPIRES_IN,
        };

        const decoded = jwt.verify(token, secretKey, jwtData);
        req.userId = decoded
        req.token = token;
       // console.log(decoded, "jwt verified")
        next();


    } catch (error) {
        console.error('Error:', error.message);
        return res.status(401).json({
            status: 0,
            message: 'You do not have any authorization access',
        });
    }
};
