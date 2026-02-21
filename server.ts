import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "code-guardian-secret-key-123";

// Database initialization
const db = new Database("database.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'dark',
    streak_count INTEGER DEFAULT 0,
    last_active_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    course_id TEXT,
    day_number INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, day_number),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

app.use(express.json());

// Course Data
const courses = [
  {
    id: "html-css",
    name: "HTML / CSS",
    days: [
      {
        day: 1,
        title: "The Skeleton of the Web",
        content: "HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It defines the structure of web content.",
        example: "<h1>Hello World</h1>\n<p>This is a paragraph.</p>",
        task: "Create an <h2> tag with the text 'My First Heading' and a <p> tag below it.",
        expectedOutput: "<h2>My First Heading</h2>\n<p>.*?</p>"
      },
      {
        day: 2,
        title: "Styling with CSS",
        content: "CSS (Cascading Style Sheets) is used to style and layout web pages — for example, to alter the font, color, size, and spacing of your content.",
        example: "h1 {\n  color: blue;\n  font-size: 24px;\n}",
        task: "Write a CSS rule to make all <p> tags have a color of 'red'.",
        expectedOutput: "p\\s*{\\s*color:\\s*red;?\\s*}"
      },
      {
        day: 3,
        title: "The Box Model",
        content: "Everything in CSS is a box. The box model consists of: Content, Padding, Border, and Margin.",
        example: ".box {\n  width: 100px;\n  padding: 10px;\n  border: 5px solid black;\n  margin: 20px;\n}",
        task: "Create a class '.card' with a padding of 20px and a border of 1px solid gray.",
        expectedOutput: ".card\\s*{\\s*padding:\\s*20px;?\\s*border:\\s*1px\\s*solid\\s*gray;?\\s*}"
      }
    ]
  },
  {
    id: "javascript",
    name: "JavaScript",
    days: [
      {
        day: 1,
        title: "Variables and Data Types",
        content: "JavaScript is a scripting language that enables you to create dynamically updating content. Variables are containers for storing data values.",
        example: "let name = 'Guardian';\nconst pi = 3.14;\nvar age = 25;",
        task: "Declare a constant named 'greeting' and assign it the value 'Hello JavaScript'.",
        expectedOutput: "const\\s+greeting\\s*=\\s*['\"]Hello JavaScript['\"];?"
      },
      {
        day: 2,
        title: "Functions",
        content: "A JavaScript function is a block of code designed to perform a particular task. It is executed when 'something' invokes it (calls it).",
        example: "function add(a, b) {\n  return a + b;\n}",
        task: "Write a function named 'square' that takes one parameter 'n' and returns its square (n * n).",
        expectedOutput: "function\\s+square\\s*\\(n\\)\\s*{\\s*return\\s+n\\s*\\*\\s*n;?\\s*}"
      },
      {
        day: 3,
        title: "Arrays and Loops",
        content: "Arrays are used to store multiple values in a single variable. Loops can execute a block of code a number of times.",
        example: "const fruits = ['Apple', 'Banana'];\nfruits.forEach(f => console.log(f));",
        task: "Create an array named 'colors' containing 'red', 'green', and 'blue'.",
        expectedOutput: "const\\s+colors\\s*=\\s*\\[\\s*['\"]red['\"]\\s*,\\s*['\"]green['\"]\\s*,\\s*['\"]blue['\"]\\s*\\];?"
      }
    ]
  },
  {
    id: "python",
    name: "Python",
    days: [
      {
        day: 1,
        title: "Python Basics",
        content: "Python is a high-level, interpreted programming language known for its readability. It uses indentation to define code blocks.",
        example: "print('Hello Python')\nx = 5\ny = 'World'",
        task: "Print the string 'I love Python' to the console.",
        expectedOutput: "print\\(['\"]I love Python['\"]\\)"
      },
      {
        day: 2,
        title: "Lists and Dictionaries",
        content: "Lists are used to store multiple items in a single variable. Dictionaries are used to store data values in key:value pairs.",
        example: "my_list = [1, 2, 3]\nmy_dict = {'name': 'AI', 'version': 3}",
        task: "Create a list named 'numbers' containing 1, 2, 3, 4, 5.",
        expectedOutput: "numbers\\s*=\\s*\\[1,\\s*2,\\s*3,\\s*4,\\s*5\\]"
      },
      {
        day: 3,
        title: "Conditional Logic",
        content: "Python supports the usual logical conditions from mathematics. These conditions can be used in 'if' statements.",
        example: "if x > 10:\n    print('Big')\nelse:\n    print('Small')",
        task: "Write an if statement that prints 'Even' if a variable 'num' is divisible by 2.",
        expectedOutput: "if\\s+num\\s*%\\s*2\\s*==\\s*0:\\s*\\n?\\s*print\\(['\"]Even['\"]\\)"
      }
    ]
  }
];

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth
app.post("/api/register", async (req, res) => {
  const { email, password, language } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = db.prepare("INSERT INTO users (email, password, language) VALUES (?, ?, ?)").run(email, hashedPassword, language || 'en');
    const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, email, language } });
  } catch (e) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, language: user.language, theme: user.theme, streak_count: user.streak_count } });
});

// User Profile & Progress
app.get("/api/me", authenticateToken, (req: any, res) => {
  const user: any = db.prepare("SELECT id, email, language, theme, streak_count, last_active_date FROM users WHERE id = ?").get(req.user.id);
  const progress = db.prepare("SELECT course_id, day_number FROM progress WHERE user_id = ?").all(req.user.id);
  res.json({ user, progress });
});

app.post("/api/settings", authenticateToken, (req: any, res) => {
  const { language, theme } = req.body;
  db.prepare("UPDATE users SET language = ?, theme = ? WHERE id = ?").run(language, theme, req.user.id);
  res.json({ success: true });
});

// Courses
app.get("/api/courses", authenticateToken, (req, res) => {
  res.json(courses);
});

// Complete Day & Streak Logic
app.post("/api/complete-day", authenticateToken, (req: any, res) => {
  const { courseId, dayNumber } = req.body;
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Record progress
    db.prepare("INSERT OR IGNORE INTO progress (user_id, course_id, day_number) VALUES (?, ?, ?)").run(userId, courseId, dayNumber);

    // Update streak
    const user: any = db.prepare("SELECT last_active_date, streak_count FROM users WHERE id = ?").get(userId);
    let newStreak = user.streak_count;

    if (!user.last_active_date) {
      newStreak = 1;
    } else {
      const lastDate = new Date(user.last_active_date);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // If diffDays === 0, streak stays the same
    }

    db.prepare("UPDATE users SET streak_count = ?, last_active_date = ? WHERE id = ?").run(newStreak, today, userId);

    res.json({ success: true, streak_count: newStreak });
  } catch (e) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
