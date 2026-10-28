


import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [membershipId, setMembershipId] = useState('');
  const [role, setRole] = useState('Member');
  const [loggedIn, setLoggedIn] = useState(false);
 const [page, setPage] = useState('Dashboard');

const [books, setBooks] = useState([]);

const [users, setUsers] = useState([]);

const [userForm, setUserForm] = useState({
  membership_id: '',
  full_name: '',
  role: 'Member',
});

const [editingUserId, setEditingUserId] = useState(null);

useEffect(() => {
  fetch('http://localhost:5000/api/books')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load books');
      }
      return response.json();
    })
    .then((data) => setBooks(data))
    .catch((error) => {
      console.error('Error loading books:', error);
      alert('Could not load books. Check that the backend is running.');
    });
}, []);
useEffect(() => {
  fetch('http://localhost:5000/api/books')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load books');
      }
      return response.json();
    })
    .then((data) => setBooks(data))
    .catch((error) => {
      console.error('Error loading books:', error);
      alert('Could not load books. Check that the backend is running.');
    });
}, []);
useEffect(() => {
  fetch('http://localhost:5000/api/users')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      return response.json();
    })
    .then((data) => setUsers(data))
    .catch((error) => {
      console.error('Error loading users:', error);
    });
}, []);
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    quantity: 1,
  });
  const [editingId, setEditingId] = useState(null);

  function handleLogin(event) {
    event.preventDefault();
    if (!membershipId.trim()) return;
    setLoggedIn(true);
    setPage('Dashboard');
  }

  async function handleBookSubmit(event) {
  event.preventDefault();

  const quantity = Number(form.quantity);

  if (
    !form.title.trim() ||
    !form.author.trim() ||
    !form.genre.trim() ||
    !form.isbn.trim() ||
    !Number.isInteger(quantity) ||
    quantity < 0
  ) {
    alert('Enter valid details for every book field.');
    return;
  }

  const bookData = {
    title: form.title.trim(),
    author: form.author.trim(),
    genre: form.genre.trim(),
    isbn: form.isbn.trim(),
    quantity,
  };

  try {
    const response = await fetch(
      editingId !== null
        ? `http://localhost:5000/api/books/${editingId}`
        : 'http://localhost:5000/api/books',
      {
        method: editingId !== null ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not save book.');
    }

    const booksResponse = await fetch('http://localhost:5000/api/books');

    if (!booksResponse.ok) {
      throw new Error('Book saved, but refreshing the list failed.');
    }

    setBooks(await booksResponse.json());
    setEditingId(null);
    setForm({
      title: '',
      author: '',
      genre: '',
      isbn: '',
      quantity: 1,
    });

    alert('Book saved successfully!');
  } catch (error) {
    console.error(error);
    alert(error.message || 'Could not connect to the backend.');
  }
}
    

    if (editingId !== null) {
      setBooks((current) =>
        current.map((book) =>
          book.id === editingId ? { ...form, quantity, id: editingId } : book
        )
      );
    
  }

  function editBook(book) {
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      quantity: book.quantity,
    });
    setEditingId(book.id);
  }

  async function deleteBook(id) {
  if (!window.confirm('Delete this book?')) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/books/${id}`,
      { method: 'DELETE' }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not delete book.');
    }

    setBooks((current) => current.filter((book) => book.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setForm({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        quantity: 1,
      });
    }

    alert('Book deleted successfully!');
  } catch (error) {
    console.error(error);
    alert(error.message || 'Could not connect to the backend.');
  }
}
  async function handleUserSubmit(event) {
  event.preventDefault();

  if (
    !userForm.membership_id.trim() ||
    !userForm.full_name.trim()
  ) {
    alert('Please enter the membership ID and full name.');
    return;
  }

  try {
    const response = await fetch(
      editingUserId !== null
        ? `http://localhost:5000/api/users/${editingUserId}`
        : 'http://localhost:5000/api/users',
      {
        method: editingUserId !== null ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          membership_id: userForm.membership_id.trim(),
          full_name: userForm.full_name.trim(),
          role: userForm.role,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not save user.');
    }

    const usersResponse = await fetch(
      'http://localhost:5000/api/users'
    );

    if (!usersResponse.ok) {
      throw new Error('User saved, but refreshing the list failed.');
    }

    setUsers(await usersResponse.json());

    setUserForm({
      membership_id: '',
      full_name: '',
      role: 'Member',
    });

    setEditingUserId(null);

    alert('User saved successfully!');
  } catch (error) {
    console.error(error);
    alert(error.message || 'Could not connect to the backend.');
  }
}

function editUser(user) {
  setUserForm({
    membership_id: user.membership_id,
    full_name: user.full_name,
    role: user.role,
  });

  setEditingUserId(user.id);
}

async function deleteUser(id) {
  if (!window.confirm('Are you sure you want to delete this user?')) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/users/${id}`,
      {
        method: 'DELETE',
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not delete user.');
    }

    setUsers((current) =>
      current.filter((user) => user.id !== id)
    );

    alert('User deleted successfully!');
  } catch (error) {
    console.error(error);
    alert(error.message || 'Could not delete user.');
  }
}

  if (!loggedIn) {
    return (
      <main className="login-page">
        <section className="login-card">
          <h1>Moholisa Community Library</h1>
          <p className="subtitle">Your gateway to knowledge</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="membershipId">Membership ID</label>
            <input
              id="membershipId"
              value={membershipId}
              onChange={(event) => setMembershipId(event.target.value)}
              placeholder="Enter your membership ID"
              required
            />
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option>Admin</option>
              <option>Librarian</option>
              <option>Member</option>
            </select>
            <button type="submit">Login</button>
          </form>
          <div className="demo-login">
            <h2>Demo Login</h2>
            <p>Admin: admin001</p>
            <p>Librarian: lib001</p>
            <p>Member: mem001</p>
          </div>
        </section>
      </main>
    );
  }

  const totalStock = books.reduce((sum, book) => sum + Number(book.quantity), 0);
  const lowStock = books.filter((book) => book.quantity < 2).length;

  return (
    <main className="dashboard-page">
      <nav className="navbar">
        <h2>Moholisa Community Library</h2>
        <div className="nav-links">
           {['Dashboard', 'Books', 'Users'].map((item) => (
            <button
              key={item}
              className={page === item ? 'active-nav' : ''}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
          <button onClick={() => setLoggedIn(false)}>Logout</button>
        </div>
      </nav>

      <section className="dashboard-content">
      
{page === 'Dashboard' ? (
  <>
    <h1>Dashboard</h1>
    <p>Welcome to the Moholisa Community Library Management System.</p>

    <div className="summary-cards">
      <article className="summary-card">
        <h3>Book Titles</h3>
        <p>{books.length}</p>
      </article>
      <article className="summary-card">
        <h3>Total Stock</h3>
        <p>{totalStock}</p>
      </article>
      <article className="summary-card">
        <h3>Users</h3>
        <p>{users.length}</p>
      </article>
      <article className="summary-card">
        <h3>Low Stock</h3>
        <p>{lowStock}</p>
      </article>
    </div>

    <section className="book-table-section">
      <h2>Book Availability</h2>
      <BookTable books={books} />
    </section>
  </>
) : page === 'Books' ? (
  <>
    <h1>Book Management</h1>
    <p>Add, update, and delete library books.</p>

    <section className="book-table-section">
      <h2>{editingId !== null ? 'Update Book' : 'Add New Book'}</h2>
      <form className="book-form" onSubmit={handleBookSubmit}>
        <label htmlFor="title">Title</label>
        <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <label htmlFor="author">Author</label>
        <input id="author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />

        <label htmlFor="genre">Genre</label>
        <input id="genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required />

        <label htmlFor="isbn">ISBN</label>
        <input id="isbn" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />

        <label htmlFor="quantity">Initial Quantity</label>
        <input id="quantity" type="number" min="0" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />

        <button type="submit">{editingId !== null ? 'Update Book' : 'Add Book'}</button>

        {editingId !== null && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setForm({ title: '', author: '', genre: '', isbn: '', quantity: 1 });
          }}>Cancel</button>
        )}
      </form>
    </section>

    <section className="book-table-section">
      <h2>Book List</h2>
      <BookTable books={books} onEdit={editBook} onDelete={deleteBook} />
    </section>
  </>
) : (
  <>
    <h1>User Management</h1>
    <p>Register and manage library members.</p>

    <section className="book-table-section">
      <h2>{editingUserId !== null ? 'Update User' : 'Register New User'}</h2>

      <form className="book-form" onSubmit={handleUserSubmit}>
        <label htmlFor="membership_id">Membership ID</label>
        <input id="membership_id" value={userForm.membership_id} onChange={(e) => setUserForm({ ...userForm, membership_id: e.target.value })} required />

        <label htmlFor="full_name">Full Name</label>
        <input id="full_name" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} required />

        <label htmlFor="user_role">Role</label>
        <select id="user_role" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
          <option value="Admin">Admin</option>
          <option value="Librarian">Librarian</option>
          <option value="Member">Member</option>
        </select>

        <button type="submit">{editingUserId !== null ? 'Update User' : 'Register User'}</button>

        {editingUserId !== null && (
          <button type="button" onClick={() => {
            setEditingUserId(null);
            setUserForm({ membership_id: '', full_name: '', role: 'Member' });
          }}>Cancel</button>
        )}
      </form>
    </section>

    <section className="book-table-section">
      <h2>Registered Users</h2>
      <table>
        <thead>
          <tr>
            <th>Membership ID</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan="4">No users registered yet.</td></tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.membership_id}</td>
                <td>{user.full_name}</td>
                <td>{user.role}</td>
                <td>
                  <button type="button" onClick={() => editUser(user)}>Update</button>{' '}
                  <button type="button" onClick={() => deleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  </>
)}

       </section>
    </main>
  );
}



function BookTable({ books, onEdit, onDelete }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Genre</th>
          <th>ISBN</th>
          <th>Available</th>
          {onEdit && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {books.length === 0 ? (
          <tr><td colSpan={onEdit ? 6 : 5}>No books available yet.</td></tr>
        ) : (
          books.map((book) => (
            <tr key={book.id} className={book.quantity < 2 ? 'low-stock-row' : ''}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.isbn}</td>
              <td>{book.quantity}</td>
              {onEdit && (
                <td>
                  <button type="button" onClick={() => onEdit(book)}>Update</button>{' '}
                  <button type="button" onClick={() => onDelete(book.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))
        )}
            </tbody>
    </table>
  );
}

export default App;