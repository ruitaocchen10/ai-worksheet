import { notFound } from "next/navigation";
import ClassHome from "@/components/classroom/class-home";
import MobileTabs from "@/components/shell/mobile-tabs";
import Sidebar from "@/components/shell/sidebar";
import { assignments, classes } from "@/lib/data";

export default async function ClassPage({ params }: PageProps<"/c/[id]">) {
  const { id } = await params;
  const classroom = classes.find((item) => item.id === id);

  if (!classroom) notFound();

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <ClassHome classroom={classroom} assignments={assignments.filter((assignment) => assignment.classId === classroom.id)} />
      <MobileTabs />
    </div>
  );
}
