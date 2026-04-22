import React from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import AddListingForm from "../components/AddListingForm";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const AddListingPage = () => {
  const { t } = useTranslation("addListing");

  const handleAddListing = async (listing) => {
    if (!auth.currentUser) {
      toast.error(t("listing.loginRequired"));
      return;
    }

    try {
      await addDoc(collection(db, "listings"), {
        ...listing,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      toast.success(t("listing.success"));
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast.error(t("listing.error"));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 pt-16 md:pt-0">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-7">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              {t("listing.createTitle")}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t("listing.createSubtitle", {
                defaultValue:
                  "Füllen Sie die Details aus und veröffentlichen Sie Ihre Immobilie in wenigen Minuten.",
              })}
            </p>
          </div>

          {/* Form */}
          <AddListingForm onSubmit={handleAddListing} />
        </div>

        <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 text-center">
          {t("listing.hint", {
            defaultValue:
              "Hinweis: Bitte überprüfen Sie Bilder, Preis und Standortdaten vor dem Speichern.",
          })}
        </p>
      </div>
    </main>
  );
};

export default AddListingPage;