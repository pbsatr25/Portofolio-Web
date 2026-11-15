import { PageShell } from "@/components/ui/PageShell";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageShell>
      <p className="font-pixel text-pixel">404</p>
      <h1 className="text-statement font-medium">This page isn’t here.</h1>
      <Button href="/" className="self-start">
        Back to the portfolio
      </Button>
    </PageShell>
  );
}
