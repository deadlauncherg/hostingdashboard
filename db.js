const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
});

module.exports = {
  getUser: (username) => new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),

  getUserById: (id) => new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),

  createUser: (username, password) => new Promise((resolve, reject) => {
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  })
};
