import bcrypt from "bcrypt";
import cookie from "cookie";
import jwt from "jsonwebtoken";

export const ONE_HOUR = 60 * 60;
const saltRound = process.env.SALT_ROUND;

export const encryptPassword = async (password) => {
  const hashed = await bcrypt.hash(password, Number(saltRound));
  return hashed;
};

export const comparePassword = async (password, hashedPassword) => {
  const match = await bcrypt.compare(password, hashedPassword);

  return match;
};

export const getNewInfo = async (input, original) => {
  let match, hashedPassword;
  const toBeUpdated = {};
  if (input["password"]) {
    match = await comparePassword(input["password"], original["password"]);
    hashedPassword = await encryptPassword(input["password"]);
  }

  Object.keys(input).map((inp) => {
    if (input[inp] !== original[inp]) {
      if (inp === "password") {
        if (!match) {
          toBeUpdated[inp] = hashedPassword;
        }
      } else {
        toBeUpdated[inp] = input[inp];
      }
    }
  });

  return toBeUpdated;
};

export const newCookie = (user, res) => {
  const token = jwt.sign({ user }, process.env.TOKEY, {
    expiresIn: "1h",
  });
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", token, {
      httpOnly: true,
      maxAge: ONE_HOUR,
      // secure: process.env.NODE_ENV === "production",
    })
  );
};
