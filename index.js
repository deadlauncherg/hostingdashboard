const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");
const settings = require("./settings.json");

const app = express();

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Discord strategy
passport.use(new DiscordStrategy({
    clientID: settings.discord.clientId,
    clientSecret: settings.discord.clientSecret,
    callbackURL: settings.discord.callbackURL,
    scope: ["identify", "email"]
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { hostingName: settings.hostingName });
});

app.get("/auth/discord", passport.authenticate("discord"));

app.get("/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.render("dashboard", {
    user: req.user,
    hostingName: settings.hostingName
  });
});

app.listen(settings.port, () => {
  console.log(`Server running on http://localhost:${settings.port}`);
});
