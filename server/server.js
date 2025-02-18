require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const User = require('./models/User');
const Task = require('./models/Task');

const app = express();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/a3';
mongoose.connect(MONGODB_URI).then(() => console.log('MongoDB connected.')).catch((err) => console.error('Could not connect to MongoDB:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET || 'a3secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) return done(null, false, { message: 'User not found' });
    if (user.password !== password) return done(null, false, { message: 'Incorrect password' });
    return done(null, user);
  } catch (error) { return done(error); }
}));

passport.use(new GitHubStrategy({ clientID: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET, callbackURL: '/auth/github/callback' }, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = new User({ username: profile.username || `GitHubUser_${profile.id}`, githubId: profile.id });
      await user.save();
    }
    return done(null, user);
  } catch (error) { return done(error); }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => { try { const user = await User.findById(id); done(null, user); } catch (err) { done(err); } });

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info.message });
    req.logIn(user, (err) => { if (err) return next(err); return res.json({ success: true, message: 'Logged in successfully' }); });
  })(req, res, next);
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(409).json({ message: 'User already exists' });
  const newUser = new User({ username, password });
  await newUser.save();
  res.json({ success: true, message: 'User registered' });
});

app.post('/logout', (req, res) => {
  req.logout((err) => { if (err) return res.status(500).json({ message: 'Logout error' }); res.json({ success: true, message: 'Logged out successfully' }); });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

// Task routes
app.get('/tasks', ensureAuthenticated, async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  res.json(tasks);
});

app.post('/tasks', ensureAuthenticated, async (req, res) => {
  const { task, priority } = req.body;
  const newTask = new Task({ userId: req.user._id, task, priority });
  await newTask.save();
  res.json(newTask);
});

app.delete('/tasks/:id', ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deletedTask = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
      if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting task' });
    }
  });

  app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: '/main',
    failureRedirect: '/login'
  })
);

// Serve React app after defining routes
app.use(express.static(path.resolve(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));