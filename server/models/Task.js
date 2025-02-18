const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  task: String,
  priority: String,
  create_date: String,
  deadline: String
});

module.exports = mongoose.model('Task', TaskSchema);
