import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";

export function LoginPage() {
  const { login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/learn";
  const [email, setEmail] = useState("ama@student.gh");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const dest = email.toLowerCase().includes("admin") ? "/admin" : from;
    navigate(dest);
  };

  return (
    <main className="page page--narrow">
      <header className="page-intro glass">
        <p className="eyebrow">Account</p>
        <h1 className="display">Sign in</h1>
        <p className="muted page-intro__lead">
          Demo login: <code>ama@student.gh</code> with password <code>demo123</code>, or{" "}
          <code>admin@echelon.edu.gh</code> with <code>admin123</code>.
        </p>
      </header>
      <form className="glass auth-form" onSubmit={onSubmit}>
        {error && <div className="alert error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Sign in
        </button>
      </form>
      <p className="muted auth-foot">
        No account yet? <Link to="/signup">Create account</Link>
        {" · "}
        <Link to="/">Home</Link>
      </p>
    </main>
  );
}

export function SignupPage() {
  const { signup } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = signup(name, email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/");
  };

  return (
    <main className="page page--narrow">
      <header className="page-intro glass">
        <p className="eyebrow">Account</p>
        <h1 className="display">Register</h1>
        <p className="muted page-intro__lead">
          Make an account. Then choose a class to enrol.
        </p>
      </header>
      <form className="glass auth-form" onSubmit={onSubmit}>
        {error && <div className="alert error">{error}</div>}
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Create account
        </button>
      </form>
      <p className="muted auth-foot">
        Already have an account? <Link to="/login">Sign in</Link>
        {" · "}
        <Link to="/">Home</Link>
      </p>
    </main>
  );
}
