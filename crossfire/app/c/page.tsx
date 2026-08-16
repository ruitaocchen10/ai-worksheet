import { redirect } from "next/navigation";

/** Mobile navigation lands on the student's most active class. */
export default function ClassesPage() {
  redirect("/c/ap-world");
}
