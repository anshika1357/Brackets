import Header from "@/components/layouts/Header";
import HomeHero from "@/components/homepage/HomeHero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      <HomeHero />
    </div>
  );
}
