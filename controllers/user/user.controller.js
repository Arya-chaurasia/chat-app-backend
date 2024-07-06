const apiResponse = require("../../helper/apiResponse");
const bcrypt = require("bcrypt");
const User = require("../../modals/user.schema");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, name, password, phoneno } = req.body;

  if (!email || !name || !phoneno) {
    return apiResponse.ErrorResponse(res, "All fields are required.");
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return apiResponse.ErrorResponse(res, "Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      phoneno,
    });

    // Return success response
    return apiResponse.successResponseWithData(
      res,
      "User successfully registered",
      user
    );
  } catch (error) {
    console.log(error);
    return apiResponse.ErrorResponse(res, "Error creating user: " + error);
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email.toLowerCase() }).then((user) => {
    if (!user) {
      return apiResponse.unauthorizedResponse(res, "Email does not exist");
    }

    bcrypt.compare(password, user.password).then((isPasswordValid) => {
      if (!isPasswordValid) {
        return apiResponse.unauthorizedResponse(res, "Invalid password");
      } else {
        const tokenPayload = {
          name: user.name,
          email: user.email,
          userId: user._id,
          phoneno: user.phoneno,
        };

        const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, {
          expiresIn: "1h",
        });

        const responseData = {
          ...user.toObject(),
          ...tokenPayload,
          token,
        };

        return apiResponse.successResponseWithData(
          res,
          "Logged in successfully",
          responseData
        );
      }
    })
    .catch((err) => {
        console.log(err)
        return apiResponse.ErrorResponse(res, "server error" + err)
    })
  }).catch((err) => {
    console.log(err);
    return apiResponse.ErrorResponse(res, "Server error: " + err)
  })
};
