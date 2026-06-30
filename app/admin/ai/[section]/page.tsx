import { notFound } from "next/navigation";
import { aiSectionItems } from "../../../../components/admin/ai/aiSections";
import { AdminAiSectionContent } from "./AdminAiSectionContent";

export function generateStaticParams() {
  return aiSectionItems.map(({ section }) => ({ section }));
}

export default async function AdminAiSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const sectionItem = aiSectionItems.find((item) => item.section === section);
  if (!sectionItem) notFound();

  return <AdminAiSectionContent section={sectionItem.section} label={sectionItem.label} />;
}
