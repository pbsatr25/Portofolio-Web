import { describe, expect, it } from "vitest";
import { cvJsonLd, homeJsonLd, personId, projectJsonLd, serializeJsonLd } from "./jsonld";
import { projects } from "@/content/work";

describe("JSON-LD", () => {
  it("home is a ProfilePage whose mainEntity is the named Person", () => {
    const [page, site] = homeJsonLd()["@graph"];
    expect(page["@type"]).toBe("ProfilePage");
    expect(page.mainEntity).toMatchObject({ "@type": "Person", "@id": personId, name: "Prihastomo Budi Satrio" });
    expect(site.publisher).toEqual({ "@id": personId });
  });

  it("omits sameAs while no profile links are set, instead of emitting empty URLs", () => {
    const person = homeJsonLd()["@graph"][0].mainEntity as Record<string, unknown>;
    if ("sameAs" in person) expect(person.sameAs).not.toContain("");
  });

  it("every case study points its author at the same Person and has a breadcrumb", () => {
    for (const p of projects) {
      const [work, crumbs] = projectJsonLd(p)["@graph"];
      expect(work.author).toEqual({ "@id": personId });
      expect(crumbs.itemListElement.at(-1)?.item).toMatch(new RegExp(`/work/${p.slug}$`));
    }
  });

  it("cv lists one occupation per experience item", () => {
    const entity = cvJsonLd()["@graph"][0].mainEntity as { hasOccupation: unknown[] };
    expect(entity.hasOccupation).toHaveLength(10);
  });

  it("serializer cannot close the script tag", () => {
    expect(serializeJsonLd({ x: "</script><script>alert(1)</script>" })).not.toContain("<");
  });
});
