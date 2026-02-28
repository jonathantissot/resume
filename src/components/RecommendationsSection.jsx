import recommendations from '../data/recommendations.json'

export default function RecommendationsSection() {
  return (
    <div className="py-16 bg-white" id="recommendations">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Recommendations</h2>
        <div className="space-y-8">
          {recommendations.recommendations.map((rec) => (
            <div key={rec.id} className="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 -ml-6 pl-6 p-6 rounded">
              <blockquote className="mb-4">
                <p className="text-gray-700 italic leading-relaxed">"{rec.quote}"</p>
              </blockquote>
              <footer className="text-sm text-gray-600">
                <a
                  href={rec.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {rec.author}
                </a>
                <p className="text-xs text-gray-600 mt-1">{rec.title}</p>
                {rec.translated && (
                  <p className="text-xs text-gray-500 mt-2 italic">[translated from spanish]</p>
                )}
              </footer>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

