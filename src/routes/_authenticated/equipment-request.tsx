import { createFileRoute } from "@tanstack/react-router";
import { Supplies } from "./supplies";

export const Route = createFileRoute("/_authenticated/equipment-request")({
  head: () => ({ meta: [{ title: "Equipment Request — LNPATS ERP" }, { name: "description", content: "Request equipment and follow your request through approval and collection." }, { property: "og:title", content: "Equipment Request — LNPATS ERP" }, { property: "og:description", content: "Request equipment and follow your request through approval and collection." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Supplies,
});
