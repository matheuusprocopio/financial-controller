export const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, 
          matrix[i][j - 1] + 1,    
          matrix[i - 1][j] + 1    
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

export interface FuzzyMatchResult {
  id: string;
  name: string;
  confidence: number;
}

export const findBestMatch = <T extends { id: string; name?: string; nickname?: string }>(
  items: T[],
  searchTerm: string | undefined,
  getNameFn: (item: T) => string
): FuzzyMatchResult => {
  if (!searchTerm || searchTerm.trim() === "") {
    const firstItem = items[0];
    return {
      id: firstItem.id,
      name: getNameFn(firstItem),
      confidence: 0.3, 
    };
  }

  let bestMatch = items[0];
  let highestScore = 0;

  for (const item of items) {
    const itemName = getNameFn(item);
    const score = calculateSimilarity(searchTerm, itemName);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return {
    id: bestMatch.id,
    name: getNameFn(bestMatch),
    confidence: highestScore,
  };
};
