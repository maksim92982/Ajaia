import { DocEditor } from "@/components/DocEditor";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocEditor id={id} />;
}
