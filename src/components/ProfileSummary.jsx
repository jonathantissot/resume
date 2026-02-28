import profile from '../data/profile.json'

export default function ProfileSummary() {
  const renderSummaryItem = (item, index) => {
    // For the last item, highlight the character traits
    if (index === profile.profileSummary.length - 1) {
      const parts = item.split(/(?= with an)/);
      return (
        <p key={index} className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
          <span className="text-blue-600 font-semibold">
            {parts[0].trim()}
          </span>
          {parts[1] && <span>{parts[1]}</span>}
        </p>
      );
    }

    return (
      <p key={index} className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
        {item}
      </p>
    );
  };

  return (
    <div className="pb-16 bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Summary */}
        <div className="mb-12 text-center">
          <div className="max-w-4xl mx-auto">
            {profile.profileSummary.map((item, index) => renderSummaryItem(item, index))}
          </div>
        </div>
      </div>
    </div>
  )
}

