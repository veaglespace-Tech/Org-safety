import HomeHero from "@/components/marketing/home/HomeHero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 transition-colors duration-500 dark:bg-slate-950 dark:text-white">
      <HomeHero />
      <div className="mt-auto py-8 px-4 text-center">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-800 dark:text-slate-200">
          Powered By - &quot;शिवमुद्रा ढोल ताशा पथक,पुणे&quot;
        </h2>
      </div>
    </div>
  );
}
