import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from '../pages/index.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    if (session) {
      console.log('Session loaded:', session);
      setForm({
        name: session.user.name || '',
        email: session.user.email || '',
        password: '',
      });
      fetchUsers();
    }
  }, [session]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setForm({ name: '', email: '', password: '' });
    setEditingUser(null);
    fetchUsers();
  };

  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '' });
    setEditingUser(user);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  if (status === 'loading') return <p>Loading...</p>;

  console.log('Session:', session);  
  console.log('Status:', status);   
  console.log('Form:', form);       

  return (
    <div className={styles.container}>
      <h1>User CRUD</h1>

      {!session ? (
        <>
          <p>Please login with GitHub</p>
          <button onClick={() => signIn('github')} className={styles.button}>Login with GitHub</button>
        </>
      ) : (
        <>
          <button onClick={() => signOut()} className={styles.button}>Sign Out</button>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            <button type="submit" className={styles.button}>{editingUser ? 'Update' : 'Create'}</button>
          </form>

          <ul className={styles.ul}>
            {users.map(user => (
              <li key={user._id} className={styles.li}>
                {user.name} ({user.email})
                <button onClick={() => handleEdit(user)} className={styles.button}>Edit</button>
                <button onClick={() => handleDelete(user._id)} className={styles.button}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
