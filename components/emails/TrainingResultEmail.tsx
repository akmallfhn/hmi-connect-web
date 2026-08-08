import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { TrainingResultEnum } from "@/lib/types";

const LOGO_URL =
  "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/logo-hmi-connect.png";

type ResultContent = {
  label: string;
  preview: (trainingName: string) => string;
  heading: string;
  announcement: (trainingName: string) => React.ReactNode;
  encouragement: string;
  accentColor: string;
  softColor: string;
};

const RESULT_CONTENT: Record<TrainingResultEnum, ResultContent> = {
  passed: {
    label: "Lulus",
    preview: (trainingName) =>
      `Selamat! Kamu dinyatakan lulus dalam ${trainingName}.`,
    heading: "Selamat atas kelulusanmu!",
    announcement: (trainingName) => (
      <>
        Kamu telah dinyatakan <strong>lulus</strong> dalam {trainingName}.
        Pencapaian ini adalah buah dari kesungguhan dan proses belajar yang
        sudah kamu jalani.
      </>
    ),
    encouragement:
      "Terus rawat semangat belajar, jaga nilai-nilai HMI, dan hadirkan ilmu yang kamu dapat menjadi amal bagi umat dan bangsa.",
    accentColor: "#0f6f72",
    softColor: "#e3f6f6",
  },
  conditional_pass: {
    label: "Lulus Bersyarat",
    preview: (trainingName) =>
      `Selamat! Kamu dinyatakan lulus bersyarat dalam ${trainingName}.`,
    heading: "Selamat, perjuanganmu membuahkan hasil!",
    announcement: (trainingName) => (
      <>
        Kamu dinyatakan <strong>lulus bersyarat</strong> dalam {trainingName}.
        Silakan hubungi panitia untuk mengetahui tindak lanjut atau persyaratan
        yang masih perlu kamu selesaikan.
      </>
    ),
    encouragement:
      "Tetap jaga semangat dan tuntaskan proses ini dengan sebaik-baiknya. Setiap langkah kecil yang diselesaikan dengan sungguh-sungguh akan membentuk kader yang lebih kuat.",
    accentColor: "#8a6300",
    softColor: "#fff7d6",
  },
  failed: {
    label: "Belum Lulus",
    preview: (trainingName) => `Pengumuman hasil ${trainingName}.`,
    heading: "Terima kasih sudah berproses bersama",
    announcement: (trainingName) => (
      <>
        Berdasarkan hasil evaluasi, kali ini kamu <strong>belum dinyatakan lulus</strong>{" "}
        dalam {trainingName}. Hasil ini tidak menghapus niat baik, waktu, dan
        usaha yang sudah kamu berikan selama mengikuti training.
      </>
    ),
    encouragement:
      "Pintu untuk terus tumbuh sebagai kader HMI selalu terbuka. Kamu dapat mengikuti Latihan Kader kembali pada kesempatan dan tempat lain. Jadikan pengalaman ini sebagai bekal untuk belajar, memperbaiki diri, dan mencoba lagi dengan keyakinan yang lebih kuat.",
    accentColor: "#b42318",
    softColor: "#feeceb",
  },
};

export interface TrainingResultEmailProps {
  fullName: string;
  trainingName: string;
  trainingUrl: string;
  result: TrainingResultEnum;
}

export function TrainingResultEmail({
  fullName,
  trainingName,
  trainingUrl,
  result,
}: TrainingResultEmailProps) {
  const content = RESULT_CONTENT[result];

  return (
    <Html lang="id">
      <Head />
      <Preview>{content.preview(trainingName)}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Row>
              <Column>
                <Img src={LOGO_URL} alt="HMI Connect" height={32} />
              </Column>
            </Row>
          </Section>

          <Section style={bodySection}>
            <Text style={eyebrow}>PENGUMUMAN HASIL TRAINING</Text>
            <Text style={greeting}>Halo, {fullName}</Text>

            <Section
              style={{
                ...resultBadge,
                backgroundColor: content.softColor,
                borderColor: content.accentColor,
              }}
            >
              <Text style={{ ...resultText, color: content.accentColor }}>
                Hasil: {content.label}
              </Text>
            </Section>

            <Text style={heading}>{content.heading}</Text>
            <Text style={paragraph}>{content.announcement(trainingName)}</Text>

            <Section style={trainingCard}>
              <Text style={trainingLabel}>TRAINING</Text>
              <Text style={trainingTitle}>{trainingName}</Text>
              <Text style={trainingResult}>
                Status kelulusan: {content.label}
              </Text>
            </Section>

            <Section
              style={{
                ...encouragementCard,
                borderLeftColor: content.accentColor,
              }}
            >
              <Text style={encouragementText}>{content.encouragement}</Text>
            </Section>

            <Section style={ctaSection}>
              <Link href={trainingUrl} style={ctaButton}>
                Lihat Detail Training
              </Link>
            </Section>

            <Section style={signature}>
              <Text style={signatureFrom}>Salam hangat,</Text>
              <Text style={signatureName}>Tim HMI Connect</Text>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              Email ini dikirim otomatis setelah penilaian {trainingName}{" "}
              ditetapkan. Jangan balas email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default TrainingResultEmail;

const body: React.CSSProperties = {
  backgroundColor: "#f5f7fb",
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: 0,
  padding: "32px 0",
};
const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 16,
  maxWidth: 600,
  margin: "0 auto",
  overflow: "hidden",
};
const header: React.CSSProperties = {
  padding: "20px 28px",
  borderBottom: "1px solid #f0f0f0",
};
const bodySection: React.CSSProperties = { padding: "28px 28px 0" };
const eyebrow: React.CSSProperties = {
  color: "#159fa2",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "1.2px",
  margin: "0 0 8px",
};
const greeting: React.CSSProperties = {
  color: "#172033",
  fontSize: 24,
  fontWeight: 700,
  margin: "0 0 18px",
};
const resultBadge: React.CSSProperties = {
  border: "1px solid",
  borderRadius: 10,
  marginBottom: 22,
  padding: "10px 16px",
};
const resultText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  margin: 0,
};
const heading: React.CSSProperties = {
  color: "#172033",
  fontSize: 19,
  fontWeight: 700,
  margin: "0 0 10px",
};
const paragraph: React.CSSProperties = {
  color: "#5f6573",
  fontSize: 14,
  lineHeight: "1.7",
  margin: "0 0 22px",
};
const trainingCard: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e6e9ef",
  borderRadius: 12,
  marginBottom: 18,
  padding: "16px 18px",
};
const trainingLabel: React.CSSProperties = {
  color: "#8a909d",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "1px",
  margin: "0 0 5px",
};
const trainingTitle: React.CSSProperties = {
  color: "#172033",
  fontSize: 16,
  fontWeight: 700,
  lineHeight: "1.5",
  margin: "0 0 4px",
};
const trainingResult: React.CSSProperties = {
  color: "#5f6573",
  fontSize: 13,
  margin: 0,
};
const encouragementCard: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderLeft: "3px solid",
  marginBottom: 22,
  padding: "14px 16px",
};
const encouragementText: React.CSSProperties = {
  color: "#41474e",
  fontSize: 13,
  fontStyle: "italic",
  lineHeight: "1.7",
  margin: 0,
};
const ctaSection: React.CSSProperties = { margin: "0 0 26px" };
const ctaButton: React.CSSProperties = {
  backgroundColor: "#159fa2",
  borderRadius: 12,
  color: "#ffffff",
  display: "block",
  fontSize: 15,
  fontWeight: 700,
  padding: "14px 20px",
  textAlign: "center",
  textDecoration: "none",
};
const signature: React.CSSProperties = {
  borderLeft: "3px solid #159fa2",
  marginBottom: 32,
  paddingLeft: 14,
};
const signatureFrom: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: 13,
  margin: 0,
};
const signatureName: React.CSSProperties = {
  color: "#172033",
  fontSize: 14,
  fontWeight: 700,
  margin: 0,
};
const divider: React.CSSProperties = {
  borderColor: "#e6e9ef",
  margin: 0,
};
const footer: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "20px 28px",
};
const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: 12,
  lineHeight: "1.6",
  margin: 0,
};
