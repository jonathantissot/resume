import skills from '../data/skills.json'

export default function SkillsSection() {
  const SkillBar = ({ skill }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-gray-900">{skill.name}</h4>
        <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
          {skill.level >= 100 ? 'Expert' : skill.level >= 80 ? 'Senior' : 'Advanced'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
      <div className="level-bar">
        <div className="level-bar-inner" style={{ width: `${skill.level}%` }}></div>
      </div>
    </div>
  )

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Skills Summary</h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Soft Skills */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Soft Skills</h3>
            <div className="bg-white p-6 rounded-lg shadow">
              {skills.softSkills.map((skill) => (
                <SkillBar key={skill.name} skill={skill} />
              ))}
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills</h3>
            <div className="bg-white p-6 rounded-lg shadow">
              {skills.technicalSkills.map((skill) => (
                <SkillBar key={skill.name} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

