const knex = require("./knex");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const TABLE_NAME = "users";

const create = async (userData) => {
  const { username, email, password, fullname } = userData;

  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    await knex(TABLE_NAME).insert({
      username,
      email,
      password: password_hash,
      fullname,
    });

    const user = await knex(TABLE_NAME).where({ email }).first();

    if (!user) {
      throw new Error("Gagal mengambil user setelah insert.");
    }

    return user;

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      if (error.message.includes("username")) {
        throw new Error("Username already taken");
      }
      if (error.message.includes("email")) {
        throw new Error("Email already registered");
      }
    }
    throw new Error(`Database error: ${error.message}`);
  }
};

const findByEmail = async (email) => {
  try {
    return await knex(TABLE_NAME).where({ email }).first();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const findById = async (id) => {
  try {
    return await knex(TABLE_NAME).where({ id_user: id }).first();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const findByUsername = async (username) => {
  try {
    return await knex(TABLE_NAME).where({ username }).first();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const findBySessionId = async (sessionId) => {
  try {
    return await knex(TABLE_NAME).where({ session_id: sessionId }).first();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Password verification error: ${error.message}`);
  }
};

const updateSessionId = async (userId, sessionId) => {
  try {
    return await knex(TABLE_NAME).where({ id_user: userId }).update({
      session_id: sessionId,
      updated_at: knex.fn.now(),
    });
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const generateVerificationToken = async (userId) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await knex(TABLE_NAME).where({ id_user: userId }).update({
      verification_token: verificationToken,
      verification_token_expires: tokenExpires,
      updated_at: knex.fn.now(),
    });

    return verificationToken;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const verifyEmail = async (verificationToken) => {
  try {
    const user = await knex(TABLE_NAME)
      .where({ verification_token: verificationToken })
      .where("verification_token_expires", ">", knex.fn.now())
      .first();

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    await knex(TABLE_NAME).where({ id_user: user.id_user }).update({
      is_verified: true,
      verification_token: null,
      verification_token_expires: null,
      updated_at: knex.fn.now(),
    });

    return user;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const updateProfile = async (userId, updateData) => {
  try {
    return await knex(TABLE_NAME)
      .where({ id_user: userId })
      .update({
        ...updateData,
        updated_at: knex.fn.now(),
      });
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  create,
  findByEmail,
  findById,
  findByUsername,
  findBySessionId,
  verifyPassword,
  updateSessionId,
  generateVerificationToken,
  verifyEmail,
  updateProfile,
  tableName: TABLE_NAME,
};
