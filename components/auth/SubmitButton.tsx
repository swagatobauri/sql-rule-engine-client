import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  children: ReactNode;
  pending?: boolean;
};

// Primary auth submit button with a built-in pending spinner.
export default function SubmitButton({ children, pending }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-[48px] w-full gap-2 text-[15px] font-semibold shadow-soft"
    >
      {pending && <Loader2 size={17} className="animate-spin" />}
      {children}
    </Button>
  );
}
