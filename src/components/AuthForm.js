import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(email); // kalon emailin si user
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
      <h2>{isRegister ? "Registrieren" : "Einloggen"}</h2>
      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      /><br /><br />
      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      /><br /><br />
      <button type="submit">{isRegister ? "Registrieren" : "Einloggen"}</button>
      <p style={{ marginTop: '10px', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Schon registriert? Jetzt einloggen." : "Noch kein Konto? Jetzt registrieren."}
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
