import React from 'react';

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Konto erstellen</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Vorname" className="w-full px-4 py-2 border rounded-md" />
          <input type="text" placeholder="Nachname" className="w-full px-4 py-2 border rounded-md" />
          <input type="email" placeholder="E-Mail" className="w-full px-4 py-2 border rounded-md" />
          <input type="email" placeholder="E-Mail bestätigen" className="w-full px-4 py-2 border rounded-md" />
          <input type="password" placeholder="Passwort" className="w-full px-4 py-2 border rounded-md" />
          <input type="password" placeholder="Passwort bestätigen" className="w-full px-4 py-2 border rounded-md" />
          <select className="w-full px-4 py-2 border rounded-md">
            <option>Benutzer</option>
            <option>Makler</option>
            <option>Administrator</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Registrieren
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Sie haben bereits ein Konto? <a href="/login" className="text-blue-600 hover:underline">Jetzt anmelden</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
