import { BrandLogo } from "@/components/BrandLogo";

export default function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="clb-card max-w-xl bg-card p-10 text-center">
        <BrandLogo
          size="lg"
          className="mx-auto mb-6 h-24 w-[22rem] max-w-full sm:h-28 sm:w-[24rem]"
        />
        <p className="clb-eyebrow">Official university platform</p>
        <h1 className="clb-title mt-3">Club Services</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          This fallback route is branded and ready, but the main Nile University Club Services experience
          lives inside the authenticated application routes.
        </p>
      </div>
    </main>
  );
}
