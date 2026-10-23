import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TownshipPulse Operations Copilot",
    short_name: "TownshipPulse",
    description: "Autonomous Infrastructure & Operations Copilot for Sime Darby Property Townships",
    start_url: "/",
    display: "standalone",
    background_color: "#070c18",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
