// src/components/TestFirestore.jsx
import { useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";

const TestFirestore = () => {
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "listings"));
        console.log("✅ Listings fetched:", snapshot.docs.length);
        snapshot.forEach((doc) => {
          console.log("📄", doc.id, doc.data());
        });
      } catch (err) {
        console.error("❌ Firestore error:", err.message);
      }
    };

    fetchListings();
  }, []);

  return null;
};

export default TestFirestore;
