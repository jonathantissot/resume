import certifications from '../data/certifications.json'

export default function CertificationsSection() {
  return (
    <div className="py-16 bg-gray-50" id="certifications">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Certifications</h3>
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Course</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 hidden md:table-cell">Institution</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Certificate</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Year</th>
              </tr>
            </thead>
            <tbody>
              {certifications.certifications.map((cert) => (
                <tr key={cert.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    {cert.certificateUrl ? (
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {cert.course}
                      </a>
                    ) : (
                      <span className="text-gray-900">{cert.course}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-700 hidden md:table-cell">{cert.institution}</td>
                  <td className="py-4 px-4 text-center">
                    {cert.hasCertificate ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-700">{cert.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

