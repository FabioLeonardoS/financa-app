import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditWorkOrderForm } from "./EditWorkOrderForm";

export default async function EditWorkOrderPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: { expenses: true }
  });

  if (!workOrder) {
    notFound();
  }

  return <EditWorkOrderForm initialData={workOrder} />;
}
