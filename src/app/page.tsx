import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { HomeContent } from "~/app/_components/home-content";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return <HomeContent userName={session.user.name ?? "Guide"} />;
}
