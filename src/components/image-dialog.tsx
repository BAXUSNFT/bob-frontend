import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast";

const ImageDialog = ({
  imageUrl,
}: {
  imageUrl: string
}) => {

  const downloadImage = async (src: any) => {
    const toastId = toast({
      title: "Downloading image...",
    });
    try {
      const imageUrl = src;
      const proxyUrl = `https://bonkapi.com/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;

      console.log('imageUrl', imageUrl, src, proxyUrl);
      const response = await fetch(proxyUrl, {
        headers: {
          Accept: "image/webp,image/apng,image/gif,image/*,*/*;q=0.8",
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Determine the file extension based on MIME type
      const mimeType = blob.type;
      let fileExtension = "jpg"; // Default to jpg
      if (mimeType === "image/png") {
        fileExtension = "png";
      } else if (mimeType === "image/webp") {
        fileExtension = "webp";
      } else if (mimeType === "image/gif") {
        fileExtension = "gif";
      }

      console.log('fileExtension', fileExtension, a.href);

      // sample filename: https://bonkai-images.s3.amazonaws.com/d66379a3-f8ec-4459-afaa-ef99f2512ffc.png
      const name = imageUrl.split("/").pop()?.split(".")[0];
      a.download = `bonkai-${name}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toastId.update({
        id: toastId.id,
        title: "Image downloaded!",
      });
    } catch (error) {
      console.error("Failed to download image: ", error);
      toastId.update({
        id: toastId.id,
        title: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={imageUrl}
          alt="BONK Image"
          width="100%"
          height="100%"
          className="hover:brightness-50 duration-300 transition-all cursor-pointer w-64 rounded-md"
        />
      </DialogTrigger>
      <DialogContent className="bg-bonk-white dark:bg-bonk-blue-dark text-bonk-orange max-w-3xl overflow-y-auto max-h-screen">
        <div className="mt-4 space-y-2">
          <img src={imageUrl} alt="BONK Image" className="rounded-sm min-h-96 bg-bonk-orange" />
          <button
            className="bg-bonk-orange text-bonk-white rounded-lg px-4 py-2 w-full duration-300 transition-all hover:opacity-80 font-herborn"
            onClick={() => downloadImage(imageUrl)}
          >
            Download
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageDialog