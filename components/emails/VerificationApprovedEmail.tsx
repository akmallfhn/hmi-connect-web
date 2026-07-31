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

const LOGO_URL =
  "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/logo-hmi-connect.png";

const FEATURES = [
  {
    emoji: "🤝",
    title: "Berjejaring dengan Kader",
    desc: "Ikuti dan terhubung dengan kader HMI dari berbagai Cabang dan Komisariat di seluruh Indonesia.",
  },
  {
    emoji: "📝",
    title: "Posting & Diskusi",
    desc: "Bagikan pemikiran, ikut berkomentar, dan berdiskusi langsung di linimasa HMI Connect.",
  },
  {
    emoji: "💳",
    title: "Kartu Anggota Digital (E-KTA)",
    desc: "Akses E-KTA digital kamu sebagai bukti keanggotaan resmi HMI, langsung dari akun ini.",
  },
];

export interface VerificationApprovedEmailProps {
  fullName: string;
  username: string;
  siteUrl: string;
}

export function VerificationApprovedEmail({
  fullName,
  username,
  siteUrl,
}: VerificationApprovedEmailProps) {
  const profileUrl = `${siteUrl}/profile/${username}`;

  return (
    <Html lang="id">
      <Head />
      <Preview>Akun kamu sudah terverifikasi di HMI Connect 🎉</Preview>
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
            <Text style={greeting}>Halo, {fullName}! 👋</Text>

            <Section style={successBadge}>
              <Text style={successText}>✅ Akun kamu sudah terverifikasi</Text>
            </Section>

            <Text style={intro}>
              Kabar baik! Pengajuan verifikasi identitas kamu sudah{" "}
              <strong>disetujui admin</strong>. Sekarang kamu resmi jadi anggota
              terverifikasi HMI Connect dan bisa menikmati semua fitur secara
              penuh.
            </Text>

            <Text style={sectionTitle}>Dengan akun ini, kamu bisa:</Text>

            {FEATURES.map((feature) => (
              <Section key={feature.title} style={featureRow}>
                <Row>
                  <Column style={featureIconCol}>
                    <div style={featureIcon}>{feature.emoji}</div>
                  </Column>
                  <Column>
                    <Text style={featureTitle}>{feature.title}</Text>
                    <Text style={featureDesc}>{feature.desc}</Text>
                  </Column>
                </Row>
              </Section>
            ))}

            <Section style={{ marginTop: 8, marginBottom: 10 }}>
              <Link href={profileUrl} style={ctaButton}>
                Buka HMI Connect
              </Link>
            </Section>

            <Text style={closing}>
              Selamat bergabung dan sampai jumpa di linimasa! 🚀
            </Text>

            <Section style={signature}>
              <Text style={sigFrom}>Salam hangat,</Text>
              <Text style={sigName}>Tim HMI Connect</Text>
            </Section>
          </Section>

          <Hr style={{ borderColor: "#e6e9ef", margin: 0 }} />

          <Section style={footer}>
            <Text style={footerText}>
              Email ini dikirim otomatis karena akun kamu baru saja diverifikasi
              di HMI Connect. Jangan balas email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default VerificationApprovedEmail;

// Styles
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
const greeting: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#172033",
  margin: "0 0 16px",
};
const successBadge: React.CSSProperties = {
  backgroundColor: "#e3f6f6",
  borderRadius: 10,
  padding: "10px 16px",
  marginBottom: 20,
};
const successText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f6f72",
  margin: 0,
};
const intro: React.CSSProperties = {
  fontSize: 14,
  color: "#5f6573",
  lineHeight: "1.7",
  margin: "0 0 24px",
};
const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#172033",
  margin: "0 0 14px",
};
const featureRow: React.CSSProperties = { marginBottom: 16 };
const featureIconCol: React.CSSProperties = { width: 44, paddingRight: 14 };
const featureIcon: React.CSSProperties = {
  backgroundColor: "#e3f6f6",
  borderRadius: "50%",
  width: 40,
  height: 40,
  textAlign: "center",
  lineHeight: "40px",
  fontSize: 18,
};
const featureTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#172033",
  margin: "0 0 2px",
};
const featureDesc: React.CSSProperties = {
  fontSize: 13,
  color: "#5f6573",
  lineHeight: "1.6",
  margin: 0,
};
const ctaButton: React.CSSProperties = {
  display: "block",
  backgroundColor: "#159fa2",
  color: "#ffffff",
  textDecoration: "none",
  borderRadius: 12,
  padding: "14px 20px",
  fontSize: 15,
  fontWeight: 700,
  textAlign: "center",
};
const closing: React.CSSProperties = {
  fontSize: 14,
  color: "#172033",
  margin: "24px 0 20px",
};
const signature: React.CSSProperties = {
  borderLeft: "3px solid #159fa2",
  paddingLeft: 14,
  marginBottom: 32,
};
const sigFrom: React.CSSProperties = {
  fontSize: 13,
  color: "#9ca3af",
  margin: 0,
};
const sigName: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#172033",
  margin: 0,
};
const footer: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "20px 28px",
};
const footerText: React.CSSProperties = {
  fontSize: 12,
  color: "#9ca3af",
  lineHeight: "1.6",
  margin: 0,
};
