import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Search } from "lucide-react";
import BoozappCollection from "./boozapp-collection";

// We're keeping the same props interface to maintain compatibility,
// but we're not using them anymore since we always show the BoozappCollection
const PromptSidebar = ({}: {
  suggestedPrompts: any[];
  bonkProducts: any[];
  handleSuggestedPromptClick: any;
  sendMessageMutation: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="sticky md:block hidden mb-auto top-4 left-0 mx-2">
        <BoozappCollection />
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="fixed top-14 left-0 bg-bonk-orange text-bonk-white rounded-l-none rounded-full p-1 md:hidden block shadow-lg">
          <Search className="size-5" />
        </SheetTrigger>
        <SheetContent className="max-h-screen overflow-y-auto p-4">
          <BoozappCollection />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default PromptSidebar;
