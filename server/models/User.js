const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: false, unique: true },
    password: { type: String, required: false },
    githubId: { type: String, required: false, unique: true, sparse: true }
});

module.exports = mongoose.model('User', UserSchema);
