import { Anton, Archivo, JetBrains_Mono, Chakra_Petch } from "next/font/google";

export const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
export const body = Archivo({ subsets: ["latin"], variable: "--font-body" });
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// Futuristic accent — used only for the closing bio line and small accents,
// never body copy. Chakra Petch reads futuristic yet stays premium on espresso.
export const future = Chakra_Petch({ weight: ["500", "600"], subsets: ["latin"], variable: "--font-future" });
