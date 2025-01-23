import { NotebookDetailClient } from "./NotebookDetail";

type Params = {
  params: {
    id: string;
  };
}

// This remains a Server Component
export default async function NotebookDetailPage({ params }: Params) {
  const { id } = await params;
  
  return <NotebookDetailClient id={id} />;
}

// Create a new client component in a separate file 