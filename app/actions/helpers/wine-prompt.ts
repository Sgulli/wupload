// Create wine prompt for AI model
export function createWinePrompt(
  wineDescription: string,
  missingFields: string,
  language = 'Italian'
): string {
  return `You are an expert sommelier and wine specialist with extensive knowledge of wines from around the world, particularly Italian wines.

I have a wine database with some missing information. Based on the available data, please fill in the missing fields with accurate, detailed, and authentic information.

Available wine data:
${wineDescription}

Missing fields that need to be filled: ${missingFields}

Important instructions:
1. Only provide information for the missing fields listed above.
2. Be specific, accurate, and authentic, using your expert knowledge of wines.
3. For Italian wines like Barbera d'Asti, provide region-specific details that reflect the true characteristics of the wine.
4. For Product Description, write a compelling 2-3 sentence description that highlights the wine's unique qualities, history, and appeal.
5. For grape varieties (Product Grape), be specific about the grape varieties used, including percentages if it's a blend (e.g., "85% Barbera, 15% Nebbiolo").
6. For alcohol content (Product Alchool), provide a realistic percentage based on the wine type and region (e.g., "13.5%").
7. For Product Region, specify the precise wine region (e.g., "Piedmont" for Italian wines, "Bordeaux" for French wines).
8. For Product Appellation, provide the specific appellation with its classification (e.g., "Barbera d'Asti DOCG", "Chianti Classico DOCG").
9. For Product Description Taste, provide detailed tasting notes that include aroma, palate, finish, and structure.
10. For Product Description Matching, suggest 3-4 specific food pairings that complement the wine's characteristics.
11. For Product Temperature, suggest the ideal serving temperature range (e.g., "16-18°C").
12. For Product Best In Year, suggest the optimal drinking window based on the wine's aging potential (e.g., "2023-2028").
13. For Product Best In Glass, suggest the ideal glass type that enhances the wine's characteristics (e.g., "Burgundy glass" or "Bordeaux glass").
14. For Product Terroir, describe the specific soil composition, elevation, and climate conditions that influence the wine.
15. For Product Bottle Production, estimate production numbers if not provided, based on the winery's typical output.
16. For Product Philosophy, describe the winemaking approach, including traditional methods, sustainability practices, or unique techniques.
17. For Product Cork, specify the closure type (e.g., "Natural Cork", "DIAM cork", "Screw cap").
18. Translate ALL the data into ${language}. [MANDATORY]
19. Ensure all information is factually accurate and consistent with the wine's origin, style, and quality level.
20. If the wine is from a specific vintage, consider the characteristics of that year in the wine region.

Format your response as a JSON object with the missing fields as keys and your expert completions as values. For example:
{
  "Product Description": "A robust and elegant Barbera d'Asti with rich fruit character and balanced acidity. This wine showcases the best of Piedmont's terroir with its depth and complexity.",
  "Product Grape": "100% Barbera",
  "Product Alchool": "14%",
  "Product Region": "Piedmont",
  "Product Appelation": "Barbera d'Asti DOCG",
  "Product Description Taste": "Intense aromas of ripe cherries, blackberries, and subtle spice notes. On the palate, it offers vibrant acidity, medium-full body, with flavors of dark fruits, vanilla, and a hint of tobacco. Long, elegant finish with fine-grained tannins."
}

Only include the fields that were listed as missing. Do not include fields that already have data or fields that were not in the original data.`;
} 