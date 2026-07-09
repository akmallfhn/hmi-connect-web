import type { Degree } from "./types";

export const DEGREE_LABELS: Record<Degree, string> = {
  diploma_ahli_pratama: "Diploma Ahli Pratama (D1)",
  diploma_ahli_muda: "Diploma Ahli Muda (D2)",
  diploma_ahli_madya: "Diploma Ahli Madya (D3)",
  sarjana: "Sarjana (S1)",
  magister: "Magister (S2)",
  doktor: "Doktor (S3)",
};

export const DEGREE_OPTIONS: { label: string; value: Degree }[] = [
  {
    label: DEGREE_LABELS.diploma_ahli_pratama,
    value: "diploma_ahli_pratama",
  },
  {
    label: DEGREE_LABELS.diploma_ahli_muda,
    value: "diploma_ahli_muda",
  },
  {
    label: DEGREE_LABELS.diploma_ahli_madya,
    value: "diploma_ahli_madya",
  },
  { label: DEGREE_LABELS.sarjana, value: "sarjana" },
  { label: DEGREE_LABELS.magister, value: "magister" },
  { label: DEGREE_LABELS.doktor, value: "doktor" },
];
