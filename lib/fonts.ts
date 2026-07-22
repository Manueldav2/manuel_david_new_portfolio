import { Anton, Archivo, JetBrains_Mono } from "next/font/google";

export const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
export const body = Archivo({ subsets: ["latin"], variable: "--font-body" });
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
