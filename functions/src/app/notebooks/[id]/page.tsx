"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../../frontend/src/app/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function NotebookDetailPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!id) return;
    const notebookDoc = doc(db, "notebooks", id);
    const unsubscribe = onSnapshot(notebookDoc, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setTitle(data.title || "");
      }
    });

    return () => unsubscribe();
  }, [id]);

  return (
    <div className="p-8">
      <Link href="/notebooks" className="text-blue-500 underline">
        ← Back to Notebooks
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Notebook Details</h1>
      <p>ID: {id}</p>
      <p>Title: {title}</p>
    </div>
  );
} 