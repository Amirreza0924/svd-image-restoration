import { createFileRoute } from "@tanstack/react-router";
import { Introduction, Demo, Playground } from "@/components";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Introduction />
      <Demo />
      <Playground />
    </>
  );
}
