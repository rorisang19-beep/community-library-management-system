import React, { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";

const starterBooks = [
  {id:1,title:"Web Development with HTML and CSS",author:"Jon Duckett",genre:"Web Development",isbn:"9781118008188",quantity:5},
  {id:2,title:"JavaScript for Beginners",author:"Mark Myers",genre:"Programming",isbn:"9781617291204",quantity:4},
  {id:3,title:"Learning React",author:"Alex Banks",genre:"Programming",isbn:"9781492051725",quantity:3},
  {id:4,title:"Database Systems",author:"Thomas Connolly",genre:"Databases",isbn:"9780132943260",quantity:6},
  {id:5,title:"Computer Networking",author:"Andrew Tanenbaum",genre:"Networking",isbn:"9780132126953",quantity:2},
  {id:6,title:"Software Engineering",author:"Ian Sommerville",genre:"Software Engineering",isbn:"9780137035151",quantity:4}
];

function useSavedData(key, initialValue) {
  const [data, setData] = useState(() => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : initialValue; }
    catch { return initialValue; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(data)); }, [key, data]);
  return [data, setData];
}

export default function App() {
  const [books, setBooks] = useSavedData("libraryBooks", starterBooks);
  const [users, setUsers] = useSavedData("libraryUsers", [{id:1,name:"Library Administrator",membershipId:"ADMIN001",role:"Librarian"}]);
  const [transactions, setTransactions] = useSavedData("libraryTransactions", []);
  const [loggedIn, setLoggedIn] = useSavedData("libraryLoggedIn", false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function login(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const id = String(form.get("membershipId")).trim();
    const password = String(form.get("password")).trim();
    if ((id === "ADMIN001" && password === "admin123") ||
        (users.some(u => u.membershipId.toLowerCase() === id.toLowerCase()) && password)) {
      setLoggedIn(true); navigate("/");
    } else alert("Incorrect login details. Try ADMIN001 / admin123.");
  }
  function addBook(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const book = {id:Date.now(),title:String(f.get("title")).trim(),author:String(f.get("author")).trim(),
      genre:String(f.get("genre")).trim(),isbn:String(f.get("isbn")).trim(),quantity:Math.max(0,Number(f.get("quantity"))||0)};
    if (!book.title || !book.author) return alert("Enter the title and author.");
    setBooks(old => [...old,book]); e.currentTarget.reset();
  }
  function deleteBook(id) {
    if (confirm("Delete this book?")) setBooks(old => old.filter(b => b.id !== id));
  }
  function transaction(book, action) {
    if (action === "Borrowed" && book.quantity < 1) return alert("This book is not available.");
    const memberId = prompt("Enter member ID:", "MEM001");
    if (!memberId || !memberId.trim()) return;
    setBooks(old => old.map(b => b.id === book.id ? {...b,quantity:Math.max(0,b.quantity+(action==="Returned"?1:-1))} : b));
    setTransactions(old => [{id:Date.now(),bookTitle:book.title,memberId:memberId.trim(),action,date:new Date().toLocaleDateString()},...old]);
  }
  function addUser(e) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const user = {id:Date.now(),name:String(f.get("name")).trim(),membershipId:String(f.get("membershipId")).trim(),role:String(f.get("role"))};
    if (!user.name || !user.membershipId) return alert("Enter the name and membership ID.");
    if (users.some(u=>u.membershipId.toLowerCase()===user.membershipId.toLowerCase())) return alert("That membership ID already exists.");
    setUsers(old=>[...old,user]); e.currentTarget.reset();
  }
  const filtered = books.filter(b => `${b.title} ${b.author} ${b.genre} ${b.isbn}`.toLowerCase().includes(search.toLowerCase()));

  if (!loggedIn) return <div className="login-page"><form className="login-card" onSubmit={login}>
    <div className="logo">CL</div><p className="eyebrow">COMMUNITY LIBRARY</p><h1>Welcome back</h1>
    <p className="muted">Sign in to manage your library.</p>
    <label>Membership ID<input name="membershipId" placeholder="Enter membership ID" required /></label>
    <label>Password<input name="password" type="password" placeholder="Enter password" required /></label>
    <button className="primary full" type="submit">Sign in →</button>
    <div className="demo">Demo login: <b>ADMIN001</b><br/>Password: <b>admin123</b></div>
  </form></div>;

  return <div className="layout"><aside className="sidebar">
    <div className="brand"><div className="logo">CL</div><div><b>Community</b><small>Library System</small></div></div>
    <p className="nav-label">MAIN MENU</p><nav>
      <NavLink to="/" end>Overview</NavLink><NavLink to="/books">Book Management</NavLink>
      <NavLink to="/availability">Availability</NavLink><NavLink to="/users">User Management</NavLink>
      <NavLink to="/transactions">Transactions</NavLink>
    </nav><button className="logout" onClick={()=>{setLoggedIn(false);navigate("/login");}}>Log out</button>
  </aside><main className="main">
    <header className="topbar"><div><p className="eyebrow">LIBRARY WORKSPACE</p><h1>Good day, Librarian</h1></div><span className="admin-badge">Administrator</span></header>
    <Routes>
      <Route path="/" element={<><section className="hero"><div><p className="eyebrow light">YOUR COMMUNITY, YOUR KNOWLEDGE</p><h2>Knowledge starts here.</h2><p>Manage books, members and lending in one simple workspace.</p></div><div className="hero-mark">CL</div></section>
        <div className="stats"><Stat title="Book titles" value={books.length}/><Stat title="Available copies" value={books.reduce((s,b)=>s+b.quantity,0)}/><Stat title="Registered users" value={users.length}/><Stat title="Transactions" value={transactions.length}/></div>
        <section className="panel"><h2>Library collection</h2><BookTable books={books.slice(-5).reverse()} onBorrow={b=>transaction(b,"Borrowed")} onDelete={deleteBook}/></section></>}/>
      <Route path="/books" element={<><PageTitle title="Book Management" subtitle="Add, search and manage your book collection."/>
        <section className="panel"><h2>Add a book</h2><form className="form-grid" onSubmit={addBook}>
          <label>Book title<input name="title" placeholder="Enter title" required/></label><label>Author<input name="author" placeholder="Enter author" required/></label>
          <label>Genre<input name="genre" placeholder="e.g. Programming"/></label><label>ISBN<input name="isbn" placeholder="ISBN number"/></label>
          <label>Initial quantity<input name="quantity" type="number" min="0" defaultValue="1"/></label><button className="primary">+ Add book</button>
        </form></section><section className="panel"><div className="panel-heading"><div><h2>All books ({books.length})</h2><p className="muted">Search by title, author, genre or ISBN.</p></div><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search books..."/></div>
          <BookTable books={filtered} onBorrow={b=>transaction(b,"Borrowed")} onDelete={deleteBook}/></section></>}/>
      <Route path="/availability" element={<><PageTitle title="Availability Management" subtitle="Check stock, borrow books and record returns."/><section className="panel"><h2>Current stock</h2><BookTable books={books} onBorrow={b=>transaction(b,"Borrowed")} onReturn={b=>transaction(b,"Returned")} onDelete={deleteBook}/></section></>}/>
      <Route path="/users" element={<><PageTitle title="User Management" subtitle="Register members and manage membership records."/>
        <section className="panel"><h2>Register a user</h2><form className="form-grid" onSubmit={addUser}><label>Full name<input name="name" placeholder="Full name" required/></label><label>Membership ID<input name="membershipId" placeholder="e.g. MEM002" required/></label><label>Role<select name="role"><option>Member</option><option>Librarian</option></select></label><button className="primary">+ Add user</button></form></section>
        <section className="panel"><h2>Registered users ({users.length})</h2><div className="table-scroll"><table><thead><tr><th>NAME</th><th>MEMBERSHIP ID</th><th>ROLE</th><th>ACTION</th></tr></thead><tbody>
          {users.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.membershipId}</td><td><span className="pill">{u.role}</span></td><td><button className="small danger" disabled={u.membershipId==="ADMIN001"} onClick={()=>setUsers(old=>old.filter(x=>x.id!==u.id))}>Remove</button></td></tr>)}
        </tbody></table></div></section></>}/>
      <Route path="/transactions" element={<><PageTitle title="Transactions" subtitle="Review borrowing and return activity."/><section className="panel"><h2>Transaction history ({transactions.length})</h2><div className="table-scroll"><table><thead><tr><th>BOOK</th><th>MEMBER ID</th><th>TYPE</th><th>DATE</th></tr></thead><tbody>
        {transactions.map(t=><tr key={t.id}><td>{t.bookTitle}</td><td>{t.memberId}</td><td><span className="pill">{t.action}</span></td><td>{t.date}</td></tr>)}
      </tbody></table></div>{!transactions.length&&<p className="muted">No transactions recorded yet.</p>}</section></>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes><footer>Community Library Management System <span>· Data saved in this browser</span></footer>
  </main></div>;
}

function Stat({title,value}) { return <div className="stat-card"><p>{title}</p><strong>{value}</strong><small>Updated automatically</small></div>; }
function PageTitle({title,subtitle}) { return <div className="page-title"><p className="eyebrow">LIBRARY WORKSPACE</p><h2>{title}</h2><p className="muted">{subtitle}</p></div>; }
function BookTable({books,onBorrow,onReturn,onDelete}) {
  return <div className="table-scroll"><table><thead><tr><th>BOOK / AUTHOR</th><th>GENRE</th><th>QUANTITY</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
    {books.map(b=><tr key={b.id}><td><b>{b.title}</b><small className="subtext">{b.author}</small></td><td>{b.genre||"—"}</td><td>{b.quantity}</td><td><span className={`pill ${b.quantity===0?"red":b.quantity<=2?"amber":""}`}>{b.quantity===0?"Unavailable":b.quantity<=2?"Low stock":"Available"}</span></td>
      <td><div className="actions"><button className="small" disabled={b.quantity<1} onClick={()=>onBorrow(b)}>Borrow</button>{onReturn&&<button className="small" onClick={()=>onReturn(b)}>Return</button>}<button className="small danger" onClick={()=>onDelete(b.id)}>Delete</button></div></td></tr>)}
  </tbody></table>{books.length===0&&<p className="muted">No books found. Add a book to get started.</p>}</div>;
}
