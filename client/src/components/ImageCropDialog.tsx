import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (croppedImage: Blob, fileName: string) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) {
      toast.error('No crop area selected');
      return;
    }

    try {
      const image = await loadImage(imageUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to target dimensions
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw the cropped image scaled to target size
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        targetWidth,
        targetHeight
      );

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `cropped-${Date.now()}.jpg`;
          onCropComplete(blob, fileName);
          onOpenChange(false);
          toast.success('Image cropped and resized successfully!');
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-white">Crop & Resize Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Crop Area */}
          <div className="relative h-96 bg-gray-800 rounded-md overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={targetWidth / targetHeight}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteCallback}
            />
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <Label className="text-white">Zoom</Label>
            <Slider
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Size Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-width" className="text-white">
                Width (px)
              </Label>
              <Input
                id="target-width"
                type="number"
                value={targetWidth}
                onChange={(e) => setTargetWidth(parseInt(e.target.value) || 800)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-height" className="text-white">
                Height (px)
              </Label>
              <Input
                id="target-height"
                type="number"
                value={targetHeight}
                onChange={(e) => setTargetHeight(parseInt(e.target.value) || 600)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Common Presets */}
          <div className="space-y-2">
            <Label className="text-white">Quick Presets</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700"
                onClick={() => {
                  setTargetWidth(1920);
                  setTargetHeight(1080);
                }}
              >
                1920×1080 (HD)
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700"
                onClick={() => {
                  setTargetWidth(1280);
                  setTargetHeight(720);
                }}
              >
                1280×720 (HD)
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700"
                onClick={() => {
                  setTargetWidth(800);
                  setTargetHeight(600);
                }}
              >
                800×600
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700"
                onClick={() => {
                  setTargetWidth(1080);
                  setTargetHeight(1080);
                }}
              >
                1080×1080 (Square)
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-700"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
              onClick={createCroppedImage}
            >
              Apply Crop & Resize
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}
