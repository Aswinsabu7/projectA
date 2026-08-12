const ApiError = require('../utilities/apiError');
const { hashPassword } = require('../utilities/password.util');
const { User } = require('../models');

async function listUsers({ page, limit, skip, sort }, filter = {}) {
  const query = { ...filter };

  const [items, total] = await Promise.all([
    User.find(query).populate('role', 'name').sort(sort).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function getUserById(id) {
  const user = await User.findById(id).populate({ path: 'role', populate: 'permissions' });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function createUser(payload, createdBy) {
  const exists = await User.findOne({
    $or: [{ email: payload.email.toLowerCase() }, { username: payload.username.toLowerCase() }],
  });
  if (exists) throw ApiError.conflict('A user with this email or username already exists');

  const hashed = await hashPassword(payload.password);
  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
    username: payload.username.toLowerCase(),
    password: hashed,
    createdBy,
  });

  return getUserById(user._id);
}

async function updateUser(id, payload, updatedBy) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  Object.assign(user, payload, { updatedBy });
  await user.save();

  return getUserById(user._id);
}

async function setUserStatus(id, status, updatedBy) {
  const user = await User.findByIdAndUpdate(id, { status, updatedBy }, { new: true }).populate('role', 'name');
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

module.exports = { listUsers, getUserById, createUser, updateUser, setUserStatus, deleteUser };
