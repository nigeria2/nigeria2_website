import { createFileRoute } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import { HomeFooter } from '../components/HomeFooter'

export const Route = createFileRoute('/privacy')({ component: Privacy })

const SECTIONS = [
  { n: 1, title: 'Information we collect', body: 'When you join our movement we collect the details you provide directly — your full name, email address, mobile number, location and state. We also collect limited technical data automatically, such as your device type, browser and general location, to keep the site secure and working properly.' },
  { n: 2, title: 'How we use your information', body: 'We use your information to send you campaign updates and calls to action, to coordinate volunteers, to analyse and improve our programmes, and to comply with legal obligations. We only send SMS and email updates to people who have opted in.' },
  { n: 3, title: 'Legal basis for processing', body: 'We process your personal data on the basis of your consent, our legitimate interest in advancing a transparent electoral process, and where necessary to comply with Nigerian law. You may withdraw your consent at any time.' },
  { n: 4, title: 'Sharing your information', body: 'We do not sell your personal data. We share it only with trusted service providers who help us operate (for example, email and SMS platforms), and only where they are bound to protect it. We may disclose data if required by law or to protect the safety of our volunteers.' },
  { n: 5, title: 'Data retention', body: 'We keep your personal data only for as long as necessary to fulfil the purposes described here, or as required by law. When it is no longer needed we securely delete or anonymise it.' },
  { n: 6, title: 'Your rights', body: 'Under the NDPA you have the right to access, correct, delete or restrict the use of your personal data, to object to processing, and to data portability. To exercise any of these rights, contact our Data Protection Officer below.' },
  { n: 7, title: 'Opting out', body: 'You can unsubscribe from emails using the link in any message, and stop SMS updates by replying STOP at any time. Opting out of communications will not affect the other rights you hold over your data.' },
  { n: 8, title: 'Security', body: 'We apply appropriate technical and organisational measures to protect your data against loss, misuse and unauthorised access. No online service can be guaranteed perfectly secure, but we work continuously to safeguard your information.' },
  { n: 9, title: 'Changes to this policy', body: 'We may update this policy from time to time. When we do, we will revise the date at the top of this page and, where changes are significant, notify you directly.' },
]

function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d8244', fontFamily: "'Archivo', sans-serif" }}>
      <HomeNav />

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '52px 40px 30px' }}>
        <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '52px', lineHeight: 0.95, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.01em' }}>Privacy Policy</h1>
        <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '15px', letterSpacing: '0.04em', color: '#cdeeda', margin: 0 }}>Last updated: 6 July 2026</p>
      </div>

      <div style={{ background: '#f4f7f2' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '52px 40px 72px' }}>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '18px', lineHeight: 1.7, color: '#33413a', margin: '0 0 40px' }}>
            Nigeria 2.0 ("we", "us", "our") is committed to protecting your privacy. This policy explains what
            information we collect when you use nigeria2.com, how we use it, and the rights you have over your data. It is
            written to align with the Nigeria Data Protection Act (NDPA) 2023.
          </p>

          {SECTIONS.map((sec) => (
            <div key={sec.n} style={{ marginBottom: '34px' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '22px', color: '#0f2a1c', margin: '0 0 10px' }}>{sec.n}. {sec.title}</div>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '17px', lineHeight: 1.7, color: '#33413a', margin: 0 }}>{sec.body}</p>
            </div>
          ))}

          <div style={{ background: '#fff', border: '1px solid #e2e8dd', borderLeft: '5px solid #0f8a4a', borderRadius: '4px', padding: '26px 28px', marginTop: '12px' }}>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '18px', color: '#0f2a1c', marginBottom: '8px' }}>Contact our Data Protection Officer</div>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: 1.6, color: '#33413a', margin: 0 }}>
              Questions or requests about your data? Email{' '}
              <a href="mailto:privacy@nigeria2.com" style={{ color: '#0f8a4a', fontWeight: 800 }}>privacy@nigeria2.com</a> and we will
              respond within 30 days.
            </p>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}
