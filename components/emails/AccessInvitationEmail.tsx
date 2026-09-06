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

export interface AccessInvitationEmailProps {
  fullName: string;
  inviterName: string;
  entityLabel: string;
  entityName: string;
  invitationUrl: string;
}

export function AccessInvitationEmail({
  fullName,
  inviterName,
  entityLabel,
  entityName,
  invitationUrl,
}: AccessInvitationEmailProps) {
  const scope = entityName ? `${entityLabel} ${entityName}` : entityLabel;

  return (
    <Html lang="id">
      <Head />
      <Preview>Kamu diundang jadi admin {scope} di HMI Connect</Preview>
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

            <Section style={badge}>
              <Text style={badgeText}>🛡️ Undangan admin {entityLabel}</Text>
            </Section>

            <Text style={intro}>
              <strong>{inviterName}</strong> mengundang kamu menjadi{" "}
              <strong>admin {scope}</strong> di HMI Connect. Sebagai admin, kamu
              bisa mengelola data, kepengurusan, dan keanggotaan {scope} lewat
              dashboard admin.
            </Text>

            <Section style={scopeCard}>
              <Text style={scopeLabel}>Kamu diundang untuk</Text>
              <Text style={scopeValue}>{scope}</Text>
            </Section>

            <Text style={intro}>
              Undangan ini belum aktif sampai kamu menerimanya. Klik tombol di
              bawah untuk meninjau dan menerima undangan.
            </Text>

            <Section style={{ marginTop: 8, marginBottom: 10 }}>
              <Link href={invitationUrl} style={ctaButton}>
                Lihat Undangan
              </Link>
            </Section>

            <Text style={closing}>
              Kalau kamu merasa tidak seharusnya menerima undangan ini, abaikan
              saja email ini — tidak ada akses yang diberikan sampai kamu
              menekan Terima.
            </Text>

            <Section style={signature}>
              <Text style={sigFrom}>Salam hangat,</Text>
              <Text style={sigName}>Tim HMI Connect</Text>
            </Section>
          </Section>

          <Hr style={{ borderColor: "#e6e9ef", margin: 0 }} />

          <Section style={footer}>
            <Text style={footerText}>
              Email ini dikirim otomatis karena seseorang mengundang kamu sebagai
              admin di HMI Connect. Jangan balas email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default AccessInvitationEmail;

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
const badge: React.CSSProperties = {
  backgroundColor: "#e3f6f6",
  borderRadius: 10,
  padding: "10px 16px",
  marginBottom: 20,
};
const badgeText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f6f72",
  margin: 0,
};
const intro: React.CSSProperties = {
  fontSize: 14,
  color: "#5f6573",
  lineHeight: "1.7",
  margin: "0 0 20px",
};
const scopeCard: React.CSSProperties = {
  border: "1px solid #e6e9ef",
  borderRadius: 12,
  padding: "16px 18px",
  marginBottom: 20,
};
const scopeLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#9ca3af",
  margin: "0 0 4px",
};
const scopeValue: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#172033",
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
  fontSize: 13,
  color: "#5f6573",
  lineHeight: "1.7",
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
