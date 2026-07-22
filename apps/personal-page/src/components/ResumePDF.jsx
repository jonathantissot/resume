import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import profile from '../data/profile.json'
import experiences from '../data/experiences.json'
import certifications from '../data/certifications.json'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 32,
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  // Header
  header: {
    marginBottom: 10,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 8,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  title: {
    fontSize: 11,
    color: '#2563eb',
    marginTop: 2,
  },
  meta: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  // Section
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 2,
    marginBottom: 6,
  },
  // Summary
  summaryText: {
    fontSize: 8.5,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 3,
  },
  // Experience
  expItem: {
    marginBottom: 7,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  expTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  expDuration: {
    fontSize: 8,
    color: '#64748b',
  },
  expCompany: {
    fontSize: 8.5,
    color: '#2563eb',
    marginBottom: 2,
  },
  expSummary: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.4,
  },
  // Certifications
  certGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  certBadge: {
    fontSize: 7.5,
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    padding: '3 6',
    borderRadius: 4,
    marginBottom: 3,
    marginRight: 3,
  },
})

const PDFDocument = () => {
  const last4Jobs = experiences.experiences.slice(0, 4)
  const validCerts = certifications.certifications.filter((c) => c.hasCertificate)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.title}>{profile.title}</Text>
          <Text style={styles.meta}>{profile.location} • {profile.email}</Text>
        </View>

        {/* Profile Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Summary</Text>
          {profile.profileSummary.map((item, i) => (
            <Text key={i} style={styles.summaryText}>{item}</Text>
          ))}
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {last4Jobs.map((job) => (
            <View key={job.id} style={styles.expItem}>
              <View style={styles.expHeader}>
                <Text style={styles.expTitle}>{job.title}</Text>
                <Text style={styles.expDuration}>{job.duration}</Text>
              </View>
              <Text style={styles.expCompany}>{job.company}</Text>
              <Text style={styles.expSummary}>{job.summary}</Text>
            </View>
          ))}
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.certGrid}>
            {validCerts.map((cert) => (
              <Text key={cert.id} style={styles.certBadge}>
                {cert.course} — {cert.institution} ({cert.year})
              </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default function ResumePDFButton() {
  return (
    <PDFDownloadLink
      document={<PDFDocument />}
      fileName={`${profile.name} - Resume.pdf`}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all duration-200 hover:scale-105 shadow-md"
    >
      {({ loading }) => (
        <>
          <i className="fa-solid fa-file-arrow-down"></i>
          {loading ? 'Preparing PDF…' : 'Download One-Pager PDF'}
        </>
      )}
    </PDFDownloadLink>
  )
}

