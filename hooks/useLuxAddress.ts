import { useState, useEffect } from 'react';

interface LuxAddressData {
  city: string;
  streets: string[];
}

const MOCK_GEOPORTAIL: Record<string, LuxAddressData> = {
  "1923": {
    city: "Luxembourg",
    streets: ["Rue du Laboratoire", "Rue de la Grève", "Rue du Fort Neipperg", "Rue d'Anvers"]
  },
  "4018": {
    city: "Esch-sur-Alzette",
    streets: ["Rue de l'Alzette", "Place de l'Hôtel de Ville", "Rue de la Libération", "Rue Victor Hugo"]
  },
  "8008": {
    city: "Strassen",
    streets: ["Route d'Arlon", "Rue de Reckenthal", "Rue des Romains", "Rue du Kiem"]
  },
  "2449": {
    city: "Luxembourg",
    streets: ["Boulevard Royal", "Grand-Rue", "Côte d'Eich", "Avenue Marie-Thérèse"]
  }
};

export const useLuxAddress = (zipCode: string | undefined | null) => {
  const [data, setData] = useState<LuxAddressData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!zipCode) {
      setData(null);
      return;
    }

    // Clean zip code (remove L-)
    const cleanZip = zipCode.replace('L-', '').trim();

    if (cleanZip.length === 4) {
      setLoading(true);
      // Simulate API latency
      const timer = setTimeout(() => {
        const result = MOCK_GEOPORTAIL[cleanZip];
        setData(result || { city: "", streets: [] });
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setData(null);
    }
  }, [zipCode]);

  return { data, loading };
};