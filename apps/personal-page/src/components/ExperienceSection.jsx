import { useState } from 'react'
import experiences from '../data/experiences.json'

export default function ExperienceSection() {
  const [expandedExperience, setExpandedExperience] = useState(null)

  const toggleExperience = (id) => {
    setExpandedExperience(expandedExperience === id ? null : id)
  }

  return (
    <div className="py-16 bg-white" id="experience">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Professional Experience</h2>

        <div className="space-y-8">
          {experiences.experiences.map((exp) => (
            <div key={exp.id} className="border-l-4 border-blue-600 pl-6 py-4">
              <div
                className="cursor-pointer hover:bg-gray-50 p-4 -ml-4 rounded transition-colors"
                onClick={() => toggleExperience(exp.id)}
              >
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <a
                    href={exp.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {exp.company}
                  </a>
                  <i className={`fa-solid text-sm transition-transform ${expandedExperience === exp.id ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                </h3>
                <p className="text-lg text-blue-700 font-semibold mt-1">{exp.title}</p>
                <p className="text-gray-600 mt-1">{exp.duration}</p>
              </div>

              {expandedExperience === exp.id && (
                <div className="mt-4 space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Summary</h4>
                    <p className="text-gray-700 leading-relaxed">{exp.summary}</p>
                  </div>

                  {exp.stats.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Key Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {exp.stats.map((stat, idx) => (
                          <div key={idx} className="bg-blue-50 p-3 rounded-lg text-center">
                            <p className="text-xl font-bold text-blue-700">{stat.value}</p>
                            <p className="text-sm text-gray-700">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {exp.jobDescription.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Job Description</h4>
                      <ul className="space-y-2">
                        {exp.jobDescription.map((desc, idx) => (
                          <li key={idx} className="flex items-start text-gray-700">
                            <span className="text-blue-600 mr-3 font-bold">•</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.projects.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Main Projects</h4>
                      <div className="space-y-4">
                        {exp.projects.map((project, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-900 mb-2">{project.title}</h5>
                            <ul className="space-y-1">
                              {project.description.map((desc, descIdx) => (
                                <li key={descIdx} className="flex items-start text-gray-700 text-sm">
                                  <span className="text-blue-600 mr-2">•</span>
                                  <span>{desc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

