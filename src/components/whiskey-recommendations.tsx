import { WhiskeyRecommendation } from "@/lib/recommendations";

interface WhiskeyRecommendationsProps {
  recommendations: WhiskeyRecommendation[];
}

export const WhiskeyRecommendations = ({ recommendations }: WhiskeyRecommendationsProps) => {
  return (
    <div className="flex flex-col gap-6 p-4 bg-whiskey-cream dark:bg-whiskey-mahogany rounded-lg">
      {recommendations.map((rec, index) => (
        <div key={index} className="flex flex-col gap-4 p-4 bg-white dark:bg-whiskey-oak rounded-lg shadow-lg border border-whiskey-caramel">
          <div className="flex gap-4">
            <img 
              src={rec.image_url} 
              alt={rec.name}
              className="w-24 h-24 object-contain rounded-lg"
            />
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-whiskey-caramel">{index + 1}. {rec.name}</h3>
              <p className="text-sm text-whiskey-charcoal dark:text-whiskey-cream">
                {rec.brand} - {rec.spirit}
              </p>
              <p className="text-sm text-whiskey-charcoal dark:text-whiskey-cream">
                Proof: {rec.proof}
              </p>
              <p className="text-sm text-whiskey-caramel">
                ${rec.price}
              </p>
              <div className="flex flex-col gap-1 mt-2 text-xs text-whiskey-charcoal dark:text-whiskey-cream">
                <p>Community: {rec.wishlists.toLocaleString()} wishlists, {rec.votes.toLocaleString()} votes, in {rec.collections.toLocaleString()} collections</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-whiskey-charcoal dark:text-whiskey-cream italic">
            Why: {rec.why}
          </p>
        </div>
      ))}
    </div>
  );
}; 