import { useState } from 'react';

export function RegisterForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Azerty!123');
  const [firstName, setFirstName] = useState('Jean');
  const [lastName, setLastName] = useState('Dupont');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          email: email.trim(),           
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      }}
      noValidate
      style={{ display: 'grid', gap: 8, maxWidth: 420 }}
    >
      <h2>Inscription</h2>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        required
      />
      <input
        type="password"
        placeholder="mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />
      <input
        placeholder="prénom"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <input
        placeholder="nom"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <button disabled={loading}>{loading ? '...' : "S'inscrire"}</button>
    </form>
  );
}

export function LoginForm({ onSubmit, loading, defaultEmail = '' }) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('Azerty!123');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();                  
        onSubmit({ email: email.trim(), password }); 
      }}
      noValidate
      style={{ display: 'grid', gap: 8, maxWidth: 420 }}
    >
      <h2>Connexion</h2>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        required
      />
      <input
        type="password"
        placeholder="mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? '...' : 'Se connecter'}
      </button>
    </form>
  );
}

export function OtpForm({ email, onSubmit, loading }) {
  const [code, setCode] = useState('');

  function handleChange(e) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(v);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ email, code }); 
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <h3>Vérification OTP</h3>
      <input
        type="text"           
        inputMode="numeric"
        pattern="\d{6}"
        placeholder="000000"
        value={code}
        onChange={handleChange}
        autoComplete="one-time-code"
        required
      />
      <button disabled={loading || code.length !== 6}>Vérifier OTP</button>
    </form>
  );
}
