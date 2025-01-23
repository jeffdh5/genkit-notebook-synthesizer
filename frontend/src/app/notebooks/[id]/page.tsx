import { NotebookDetailClient } from "./NotebookDetail";

// This remains a Server Component
export default async function NotebookDetailPage(props: { params: tParams }) {
  const { id } = await props.params;
  
  return <NotebookDetailClient id={id} />;
}

// Create a new client component in a separate file 