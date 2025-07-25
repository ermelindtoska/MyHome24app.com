// src/pages/LoginRegister.jsx
import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const LoginRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default role
  const [isRegister, setIsRegister] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Ruaj rolin në koleksionin "roles"
        await setDoc(doc(db, "roles", uid), {
          role: role,
          createdAt: new Date(),
        });

        alert(t("registerSuccess"));
        navigate(`/${role}-dashboard`);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Lexo rolin nga Firestore
        const roleDoc = await getDoc(doc(db, "roles", uid));
        if (roleDoc.exists()) {
          const userRole = roleDoc.data().role;
          navigate(`/${userRole}-dashboard`);
        } else {
          navigate("/unauthorized"); // nëse s'ka rol të ruajtur
        }

        alert(t("loginSuccess"));
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">
          {isRegister ? t("register") : t("login")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />

          {isRegister && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="user">{t("user")}</option>
              <option value="owner">{t("owner")}</option>
              <option value="agent">{t("agent")}</option>
            </select>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            {isRegister ? t("register") : t("login")}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-700 dark:text-gray-300">
          {isRegister ? t("haveAccount") : t("noAccount")}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:underline"
          >
            {isRegister ? t("loginHere") : t("registerHere")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;
