import { notFound } from "next/navigation";
import { customerSections, isCustomerSection } from "../../../../components/admin/inbox/customerSections";
import { InboxSectionContent } from "./InboxSectionContent";

export function generateStaticParams() {
  return customerSections.map((section) => ({ section }));
}

export default async function AdminInboxSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isCustomerSection(section)) notFound();

  return <InboxSectionContent section={section} />;
}
