import { homeJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/ui/JsonLd";
import { Intro } from "@/components/sections/Intro";
import { About } from "@/components/sections/About";
import { Stack } from "@/components/sections/Stack";
import { Statement } from "@/components/sections/Statement";
import { AskMyCV } from "@/components/sections/Ask";
import { PromptDefender } from "@/components/sections/Play";
import { Work } from "@/components/sections/Work";
import { Experience } from "@/components/sections/Experience";
import { Contact, Footer } from "@/components/sections/Contact";
import { Loader } from "@/components/motion/Loader";
import { Motion } from "@/components/motion/Motion";
import { Constellation } from "@/components/motion/Constellation";

// Section order follows Figma FIX desktop (confirmed by PBS) on every breakpoint.
export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Loader />
      <Motion />
      <Constellation />
      <Intro />
      <main id="main">
        <About />
        <Stack />
        <Statement />
        <AskMyCV />
        <PromptDefender />
        <Work />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
