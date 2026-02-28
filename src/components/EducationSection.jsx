import education from '../data/education.json'

export default function EducationSection() {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'finished':
        return 'bg-green-100 text-green-800'
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'on going':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="py-16 bg-white" id="educourses">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Education & Courses</h2>

        {/* Academic Education */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Academic Education</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Degree</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Institution</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Subjects</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Year</th>
                </tr>
              </thead>
              <tbody>
                {education.education.map((edu) => (
                  <tr key={edu.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900">{edu.degree}</td>
                    <td className="py-4 px-4 text-gray-700">{edu.institution}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(edu.status)}`}>
                        {edu.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{edu.approvedSubjects}</td>
                    <td className="py-4 px-4 text-gray-700">{edu.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

