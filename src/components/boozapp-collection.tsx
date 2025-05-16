import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Search } from "lucide-react";
import { apiClient, BoozappItem } from "@/lib/api";

const DEFAULT_USERNAME = "tradefortendies";

// Keep the mock data as fallback
const MOCK_DATA: BoozappItem[] = [
  {
    id: 1030823,
    bar_id: 1030823,
    fill_percentage: 0,
    product: {
      name: "Heaven Hill Bottled In Bond 7 Year",
      image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/recSJfTSxTvljLvF8",
      brand: "Heaven Hill",
      spirit: "Bourbon",
      proof: 100,
      size: "750",
      average_msrp: 39.99
    }
  },
  {
    id: 1007256,
    bar_id: 1007256,
    fill_percentage: 0,
    product: {
      name: "Rare Perfection 14 Year",
      image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/247ad792-6d80-4d4d-92f6-4789183cd2f0",
      brand: "Rare Perfection",
      spirit: "Canadian Whisky",
      proof: 100.7,
      size: "750",
      average_msrp: 160
    }
  },
  {
    id: 1007254,
    bar_id: 1007254,
    fill_percentage: 100,
    product: {
      name: "Empress 1908 Indigo Gin",
      image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/b67b57e0-548c-430d-982f-d9c68f3d17f4",
      brand: "Empress 1908",
      spirit: "Gin",
      proof: 85,
      size: "750",
      average_msrp: 39.97
    }
  },
  {
    id: 993981,
    bar_id: 993981,
    fill_percentage: 76,
    product: {
      name: "J.P. Wiser's 18 Year",
      image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/rec03I5wSqGi19rXR",
      brand: "J.P. Wiser's",
      spirit: "Canadian Whisky",
      proof: 80,
      size: "750",
      average_msrp: 61.87
    }
  },
  {
    id: 950916,
    bar_id: 950916,
    fill_percentage: 100,
    product: {
      name: "Hendrick's Gin",
      image_url: "https://d1w35me0y6a2bb.cloudfront.net/newproducts/recvWBDL5jDagd2Dw",
      brand: "Hendrick's",
      spirit: "Gin",
      proof: 88,
      size: "750",
      average_msrp: 37.97
    }
  }
];

interface CollectionDisplayProps {
  mobile?: boolean;
  username: string;
  isLoading: boolean;
  error: Error | null;
  collection: BoozappItem[];
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CollectionDisplay = ({
  mobile = false,
  username,
  isLoading,
  error,
  collection,
  onUsernameChange,
  onSubmit,
  onKeyDown
}: CollectionDisplayProps) => (
  <div className="flex flex-col gap-4 p-4 bg-bonk-white dark:bg-bonk-blue-dark rounded-lg shadow-lg">
    <div className="p-4 bg-bonk-orange/10 rounded-lg border border-bonk-orange/20">
      <h2 className="text-lg font-semibold text-bonk-orange mb-2">Welcome to Drunk BOB! 🥃</h2>
      <p className="text-sm text-bonk-gray-light dark:text-bonk-white/80">
        BOB works best if you have a public Boozapp profile. Enter your username here to see your collection and mention your username in conversation to see relevant recommendations.
      </p>
    </div>

    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <Input
        placeholder="Enter Boozapp username"
        value={username}
        onChange={onUsernameChange}
        onKeyDown={onKeyDown}
        className="flex-1"
      />
      <Button 
        type="submit"
        className="bg-bonk-orange text-bonk-white"
      >
        <Search className="size-4" />
      </Button>
    </form>
    
    {isLoading && <div className="text-center">Loading...</div>}
    {error && !isLoading && (
      <div className="text-center text-yellow-600 dark:text-yellow-400 text-sm">
        Using preview data. {username !== DEFAULT_USERNAME && "Try 'tradefortendies' for a working example."}
      </div>
    )}
    
    {collection.length === 0 && !isLoading && (
      <div className="text-center">No items found in collection.</div>
    )}
    
    {collection.length > 0 && (
      <div className={`grid grid-cols-1 gap-4 ${mobile ? '' : 'max-h-[80vh] overflow-y-auto'}`}>
        {collection.map((item: BoozappItem) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 p-2 bg-bonk-white dark:bg-bonk-blue-dark rounded-lg border border-bonk-orange"
          >
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="w-full h-32 object-contain rounded-lg"
              loading="lazy"
            />
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-bonk-orange">
                {item.product.name}
              </h3>
              <p className="text-sm">
                {item.product.brand} - {item.product.spirit}
              </p>
              <p className="text-sm">
                {item.product.proof} proof - {item.product.size}ml
              </p>
              <p className="text-sm">
                MSRP: ${item.product.average_msrp}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-bonk-orange h-2.5 rounded-full"
                  style={{ width: `${item.fill_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const BoozappCollection = () => {
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [isOpen, setIsOpen] = useState(false);
  const [collection, setCollection] = useState<BoozappItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCollection = async (username: string) => {
    if (!username) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try API fetch first
      console.log(`Fetching collection for username: ${username}`);
      const data = await apiClient.getBoozappCollection(username);
      setCollection(data);
    } catch (err) {
      console.error("Error fetching collection:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to mock data on error
      console.log("Falling back to mock data");
      setCollection(MOCK_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection(DEFAULT_USERNAME);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCollection(username);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchCollection(username);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <>
      <div className="sticky md:block hidden mb-auto top-4 left-0 mx-2">
        <CollectionDisplay
          username={username}
          isLoading={isLoading}
          error={error}
          collection={collection}
          onUsernameChange={handleUsernameChange}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="fixed top-14 left-0 bg-bonk-orange text-bonk-white rounded-l-none rounded-full p-1 md:hidden block shadow-lg">
          <Search className="size-5" />
        </SheetTrigger>
        <SheetContent className="max-h-screen overflow-y-auto p-4">
          <CollectionDisplay
            mobile={true}
            username={username}
            isLoading={isLoading}
            error={error}
            collection={collection}
            onUsernameChange={handleUsernameChange}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BoozappCollection; 