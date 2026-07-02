import { redirect } from "next/navigation";

export default function BlogCoursesPage() {
  redirect("/blog/documents?tab=videos");
}
