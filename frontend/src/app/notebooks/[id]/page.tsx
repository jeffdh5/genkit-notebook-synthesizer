"use client";
import * as React from 'react';
import { NotebookDetailClient } from "./NotebookDetail";

type Params = {
  params: {
    id: string;
  };
}

function NotebookDetailPage({ params }: { params: React.Usable<{ id: string }> }) {
  // asynchronous access of `params.id`.
  const { id } = React.use(params);
  return <NotebookDetailClient id={id} />;
}

export default NotebookDetailPage;