const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");
const settings = require("./settings.json");

const app = express();

// Session middleware
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy(
  {
    clientID: settings.discord.clientID,
    clientSecret: settings.discord.clientSecret,
    callbackURL: settings.discord.callbackURL,
    scope: ["identify", "email", "guilds"]
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }
));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { hostingName: settings.hostingName });
});

app.get("/auth/discord", passport.authenticate("discord"));

app.get("/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }),
  (req, res) => res.redirect("/dashboard")
);

app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { hostingName: settings.hostingName, user: req.user });
});

app.get("/servers", ensureAuthenticated, (req, res) => {
  res.render("servers", { hostingName: settings.hostingName, user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

// Start server
const PORT = settings.port || 3000;
app.listen(PORT, () => {
  console.log(`Dashboard running on http://localhost:${PORT}`);
});
