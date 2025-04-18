export interface WhiskeyRecommendation {
  name: string;
  image_url: string;
  brand: string;
  spirit: string;
  proof: number;
  price: string | number;
  why: string;
}

export interface RecommendationResponse {
  message: string;
  recommendations: WhiskeyRecommendation[];
}

export const formatRecommendations = (recommendations: WhiskeyRecommendation[]): RecommendationResponse => {
  return {
    message: "Based on your collection and preferences, here are my top 3 recommendations:",
    recommendations: recommendations.map((rec, index) => ({
      ...rec,
      image_url: rec.image_url || `/placeholder-whiskey.png`
    }))
  };
};

export const parseRecommendationsFromText = (text: string): WhiskeyRecommendation[] => {
  console.log("text", text);
  const recommendations: WhiskeyRecommendation[] = [];
  const lines = text.split('\n');
  let currentRec: Partial<WhiskeyRecommendation> = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Handle numbered items with name and price (e.g., "1. **Blanton's Original Single Barrel** - $74.99")
    const nameAndPriceMatch = trimmedLine.match(/^\d+\.\s+\*\*(.*?)\*\*\s*-\s*\$(\d+\.?\d*)/);
    if (nameAndPriceMatch) {
      if (Object.keys(currentRec).length > 0) {
        recommendations.push(currentRec as WhiskeyRecommendation);
      }
      currentRec = {
        name: nameAndPriceMatch[1].trim(),
        price: parseFloat(nameAndPriceMatch[2]),
        brand: nameAndPriceMatch[1].split(' ')[0].trim(), // Use first word as brand
        spirit: 'Unknown', // Default spirit type
        proof: 0, // Default proof
        image_url: '/images/placeholder-whiskey.png', // Default image
        why: '' // Default reasoning
      };
    }
    // Handle numbered items without price (e.g., "3. **E.H. Taylor**")
    else if (trimmedLine.match(/^\d+\.\s+\*\*(.*?)\*\*/)) {
      if (Object.keys(currentRec).length > 0) {
        recommendations.push(currentRec as WhiskeyRecommendation);
      }
      const nameMatch = trimmedLine.match(/^\d+\.\s+\*\*(.*?)\*\*/);
      currentRec = {
        name: nameMatch![1].trim(),
        price: -1, // Use -1 to indicate unknown price
        brand: nameMatch![1].split(' ')[0].trim(), // Use first word as brand
        spirit: 'Unknown', // Default spirit type
        proof: 0, // Default proof
        image_url: '/images/placeholder-whiskey.png', // Default image
        why: '' // Default reasoning
      };
    }
    // Handle proof (e.g., "Proof: 93")
    else if (trimmedLine.startsWith('Proof:')) {
      const proofValue = parseInt(trimmedLine.split(':')[1].trim());
      if (!isNaN(proofValue) && proofValue > 0 && proofValue <= 200) { // Valid proof range
        currentRec.proof = proofValue;
      }
    }
    // Handle type (e.g., "Type: Bourbon")
    else if (trimmedLine.startsWith('Type:')) {
      const spiritType = trimmedLine.split(':')[1].trim();
      // Only accept valid spirit types
      if (spiritType && !spiritType.match(/^\d+$/)) {
        currentRec.spirit = spiritType;
      }
    }
    // Handle image URL (e.g., "Image: https://...")
    else if (trimmedLine.startsWith('Image:')) {
      const imageUrl = trimmedLine.split(':').slice(1).join(':').trim();
      // Only accept valid URLs
      if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('undefined')) {
        currentRec.image_url = imageUrl;
      }
    }
    // Handle why section (e.g., "Why: matches your preference...")
    else if (trimmedLine.startsWith('Why:')) {
      const why = trimmedLine.split(':').slice(1).join(':').trim();
      if (why) {
        currentRec.why = why;
      }
    }
  }

  // Don't forget to add the last recommendation
  if (Object.keys(currentRec).length > 0) {
    recommendations.push(currentRec as WhiskeyRecommendation);
  }

  // Set defaults for missing values and format the response
  console.log("recommendations", recommendations);
  
  return recommendations.map(rec => ({
    ...rec,
    image_url: (!rec.image_url || !rec.image_url.startsWith('http') || rec.image_url.includes('undefined')) 
      ? '/images/placeholder-whiskey.png' 
      : rec.image_url,
    price: rec.price === -1 ? "UNKNOWN" : rec.price,
    spirit: rec.spirit || 'Unknown',
    proof: (!rec.proof || rec.proof < 0 || rec.proof > 200) ? 0 : rec.proof,
    why: rec.why || 'No additional information available'
  }));
}; 