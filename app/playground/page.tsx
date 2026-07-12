import Navbar from "@/components/Navbar";
import SandboxExample from "@/components/playground/SandboxExample";

export const metadata = {
  title: "CareerCafe — Code Playground",
  description: "A live in-browser sandbox to prototype and run code.",
};

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            Code Playground
          </h1>
          <p className="mt-1 text-sm text-body">
            Prototype ideas in a live sandbox — edit code, preview the result,
            and read the console output side by side.
          </p>
        </div>

        <div className="h-[640px] rounded-2xl border border-black/[0.07] bg-white shadow-card overflow-hidden">
          <SandboxExample />
        </div>
      </main>
    </div>
  );
}
