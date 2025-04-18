import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { useState } from "react"

const ProductSheet = ({
    children,
    product,
    handleSuggestedPromptClick,
    pending,
}: {
    children: React.ReactNode
    product: {
        name: string
        description: string
        image: string
        url: string
        steps: string[]
        suggestedPrompts: string[]
    }
    handleSuggestedPromptClick: (e: React.MouseEvent<HTMLButtonElement>, prompt: string) => void
    pending: boolean
}) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <Sheet
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <SheetTrigger>
                {children}
            </SheetTrigger>
            <SheetContent className="overflow-y-auto max-h-screen">
                <SheetHeader>
                    <SheetTitle>{product.name}</SheetTitle>
                    <SheetDescription>
                        {product.description}
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-4">
                    <img src={product.image} alt={product.name} className="rounded-lg border border-whiskey-caramel mt-4" />
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="bg-whiskey-caramel text-whiskey-cream rounded-lg px-4 py-2 w-full flex justify-center font-herborn hover:opacity-50 duration-300 transition-all">
                        View product
                    </a>
                    <ol className="text-whiskey-caramel list-decimal ml-4">
                        {product.steps.map((step, index) => {
                            return (
                                <li key={index}>
                                    {step}
                                </li>
                            )
                        })}
                    </ol>
                    <div className="space-y-2">
                        {product.suggestedPrompts.map((prompt, index) => {
                            return (
                                <Button
                                    key={index}
                                    onClick={(e) => {
                                        handleSuggestedPromptClick(e, prompt)
                                        setIsOpen(false)
                                    }}
                                    disabled={pending}
                                    variant="whiskey"
                                    className="whitespace-pre-wrap text-start h-full"
                                >
                                    {prompt}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </SheetContent>
        </Sheet>

    )
}

export default ProductSheet