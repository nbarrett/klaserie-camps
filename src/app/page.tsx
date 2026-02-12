import { auth } from "~/server/auth";
import { HomeContent } from "~/app/_components/home-content";
import { LandingPage } from "~/app/_components/landing-page";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <LandingPage />;
  }

  return <HomeContent userName={session.user.name ?? "Guide"} />;
}
