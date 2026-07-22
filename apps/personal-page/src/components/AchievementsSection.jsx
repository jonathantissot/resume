import achievements from '../data/achievements.json'

export default function AchievementsSection() {
  return (
    <div className="py-16 bg-gray-50" id="achievements">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <i className="fa-solid fa-check text-2xl text-green-600"></i>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-blue-600">{achievement.year}</p>
                  <p className="text-gray-900 font-semibold mt-1">{achievement.title}</p>
                  <p className="text-sm text-gray-600 mt-2">{achievement.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

