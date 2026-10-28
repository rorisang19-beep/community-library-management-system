
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test backend and database connection
app.get("/", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      message: "Moholisa Library backend and database are connected!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ==================== BOOKS ====================

// Get all books
app.get("/api/books", async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM books ORDER BY id DESC");
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve books" });
  }
});

// Add a book
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !genre?.trim() ||
      !isbn?.trim() ||
      quantity === undefined ||
      quantity === null ||
      quantity === "" ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        error: "Provide a title, author, genre, ISBN and valid quantity"
      });
    }

    const [result] = await db.query(
      `INSERT INTO books (title, author, genre, isbn, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        author.trim(),
        genre.trim(),
        isbn.trim(),
        Number(quantity)
      ]
    );

    res.status(201).json({
      message: "Book added successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "This ISBN already exists" });
    }

    res.status(500).json({ error: "Failed to add book" });
  }
});

// Update a book
app.put("/api/books/:id", async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const { id } = req.params;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !genre?.trim() ||
      !isbn?.trim() ||
      quantity === undefined ||
      quantity === null ||
      quantity === "" ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        error: "Provide a title, author, genre, ISBN and valid quantity"
      });
    }

    const [result] = await db.query(
      `UPDATE books
       SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
       WHERE id = ?`,
      [
        title.trim(),
        author.trim(),
        genre.trim(),
        isbn.trim(),
        Number(quantity),
        id
      ]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        "SELECT id FROM books WHERE id = ?",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Book not found" });
      }
    }

    res.json({ message: "Book updated successfully" });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "This ISBN already exists" });
    }

    res.status(500).json({ error: "Failed to update book" });
  }
});

// Delete a book
app.delete("/api/books/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM books WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "This book has transaction history and cannot be deleted"
      });
    }

    res.status(500).json({ error: "Failed to delete book" });
  }
});

// ==================== USERS ====================

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, membership_id, full_name, role FROM users ORDER BY id DESC"
    );

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
});

// Register a user
app.post("/api/users", async (req, res) => {
  try {
    const { membership_id, full_name, role = "Member" } = req.body;

    const allowedRoles = ["Admin", "Librarian", "Member"];

    if (
      !membership_id?.trim() ||
      !full_name?.trim() ||
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        error: "Provide a membership ID, full name and valid role"
      });
    }

    const [result] = await db.query(
      `INSERT INTO users (membership_id, full_name, role)
       VALUES (?, ?, ?)`,
      [membership_id.trim(), full_name.trim(), role]
    );

    res.status(201).json({
      message: "User registered successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "This membership ID already exists"
      });
    }

    res.status(500).json({ error: "Failed to register user" });
  }
});

// Update a user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { membership_id, full_name, role } = req.body;
    const allowedRoles = ["Admin", "Librarian", "Member"];

    if (
      !membership_id?.trim() ||
      !full_name?.trim() ||
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        error: "Provide a membership ID, full name and valid role"
      });
    }

    const [result] = await db.query(
      `UPDATE users
       SET membership_id = ?, full_name = ?, role = ?
       WHERE id = ?`,
      [membership_id.trim(), full_name.trim(), role, req.params.id]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        "SELECT id FROM users WHERE id = ?",
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "This membership ID already exists"
      });
    }

    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete a user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM users WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "This user has transaction history and cannot be deleted"
      });
    }

    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ==================== TRANSACTIONS ====================

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT
        t.id,
        t.user_id,
        t.book_id,
        t.borrow_date,
        t.return_date,
        t.status,
        u.full_name,
        u.membership_id,
        b.title AS book_title,
        b.author AS book_author
      FROM transactions t
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN books b ON t.book_id = b.id
      ORDER BY t.id DESC
    `);

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve transactions" });
  }
});

// Borrow a book
app.post("/api/transactions/borrow", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { user_id, book_id, borrow_date } = req.body;

    if (!user_id || !book_id) {
      return res.status(400).json({
        error: "User ID and book ID are required"
      });
    }

    await connection.beginTransaction();

    const [users] = await connection.query(
      "SELECT id FROM users WHERE id = ? FOR UPDATE",
      [user_id]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    const [books] = await connection.query(
      "SELECT id, quantity FROM books WHERE id = ? FOR UPDATE",
      [book_id]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Book not found" });
    }

    if (books[0].quantity < 1) {
      await connection.rollback();
      return res.status(400).json({
        error: "This book is currently unavailable"
      });
    }

    await connection.query(
      `INSERT INTO transactions (user_id, book_id, borrow_date, status)
       VALUES (?, ?, ?, 'Borrowed')`,
      [user_id, book_id, borrow_date || new Date().toISOString().slice(0, 10)]
    );

    await connection.query(
      "UPDATE books SET quantity = quantity - 1 WHERE id = ?",
      [book_id]
    );

    await connection.commit();

    res.status(201).json({ message: "Book borrowed successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to borrow book" });
  } finally {
    connection.release();
  }
});

// Return a book
app.put("/api/transactions/:id/return", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const return_date =
      req.body.return_date || new Date().toISOString().slice(0, 10);

    await connection.beginTransaction();

    const [transactions] = await connection.query(
      `SELECT id, book_id, status
       FROM transactions
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (transactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transactions[0].status === "Returned") {
      await connection.rollback();
      return res.status(400).json({
        error: "This book has already been returned"
      });
    }

    await connection.query(
      `UPDATE transactions
       SET status = 'Returned', return_date = ?
       WHERE id = ?`,
      [return_date, id]
    );

    await connection.query(
      "UPDATE books SET quantity = quantity + 1 WHERE id = ?",
      [transactions[0].book_id]
    );

    await connection.commit();

    res.json({ message: "Book returned successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to return book" });
  } finally {
    connection.release();
  }
});

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


