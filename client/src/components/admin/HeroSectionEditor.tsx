import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ContentPreviewDialog } from "@/components/ContentPreviewDialog";
import { useAutoSave } from "@/hooks/useAutoSave";
import { toast } from "sonner";
import { Save, Eye, Upload, Video, Image as ImageIcon, Clock, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function HeroSectionEditor() {
  const { data: heroData, isLoading, refetch } = trpc.admin.content.get.useQuery({ blockKey: "hero_section" });
  const upsertHero = trpc.admin.content.upsert.useMutation();

  const metadata = (heroData?.metadata as any) || {};
  const [title, setTitle] = useState(heroData?.title || "");
  const [subtitle, setSubtitle] = useState(metadata.subtitle || "");
  const [ctaPrimary, setCtaPrimary] = useState(metadata.ctaPrimary || "");
  const [ctaSecondary, setCtaSecondary] = useState(metadata.ctaSecondary || "");
  const [mediaUrl, setMediaUrl] = useState(heroData?.mediaUrl || "");
  const [mediaType, setMediaType] = useState<"image" | "video">(metadata.mediaType || "video");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Stable data object for auto-save
  const autoSaveData = useMemo(
    () => ({ title, subtitle, ctaPrimary, ctaSecondary, mediaUrl, mediaType }),
    [title, subtitle, ctaPrimary, ctaSecondary, mediaUrl, mediaType]
  );

  const { isSaving, lastSaved } = useAutoSave({
    data: autoSaveData,
    onSave: async (data) => {
      await upsertHero.mutateAsync({
        blockKey: "hero_section",
        blockType: "hero",
        title: data.title,
        content: data.subtitle,
        mediaUrl: data.mediaUrl,
        metadata: {
          subtitle: data.subtitle,
          ctaPrimary: data.ctaPrimary,
          ctaSecondary: data.ctaSecondary,
          mediaType: data.mediaType,
        },
        status: "draft",
      });
      refetch();
    },
    delay: 3000,
  });

  const handleSave = async (status: "draft" | "published") => {
    try {
      await upsertHero.mutateAsync({
        blockKey: "hero_section",
        blockType: "hero",
        title,
        content: subtitle,
        mediaUrl,
        metadata: { subtitle, ctaPrimary, ctaSecondary, mediaType },
        status,
      });
      toast.success(status === "published" ? "Hero section published!" : "Changes saved as draft");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    }
  };

  const handleMediaUpload = async (file: File) => {
    toast.info("Media upload functionality coming soon");
  };

  if (isLoading) {
    return <div className="text-white p-4">Loading hero section...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-[#00d4ff]" />
                Hero Section Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage the main hero section of your BrainPower AI website
              </CardDescription>
            </div>
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <span className="text-yellow-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 animate-pulse" />
                  Auto-saving...
                </span>
              ) : lastSaved ? (
                <span className="text-green-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              ) : (
                <span className="text-gray-500 text-xs">Auto-save enabled</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Media Type Selection */}
          <div className="space-y-2">
            <Label className="text-white">Media Type</Label>
            <div className="flex gap-4">
              <Button
                variant={mediaType === "video" ? "default" : "outline"}
                onClick={() => setMediaType("video")}
                className={mediaType === "video" ? "bg-[#00d4ff] text-black" : "border-gray-700"}
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
              <Button
                variant={mediaType === "image" ? "default" : "outline"}
                onClick={() => setMediaType("image")}
                className={mediaType === "image" ? "bg-[#00d4ff] text-black" : "border-gray-700"}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label className="text-white">Hero {mediaType === "video" ? "Video" : "Image"}</Label>
            <div className="flex gap-4">
              <Input
                type="file"
                accept={mediaType === "video" ? "video/*" : "image/*"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMediaUpload(file);
                }}
                className="bg-gray-800 border-gray-700 text-white"
              />
              {mediaUrl && (
                <Button variant="outline" className="border-gray-700" onClick={() => window.open(mediaUrl, "_blank")}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              )}
            </div>
            {mediaUrl && <p className="text-sm text-gray-400">Current: {mediaUrl}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="hero-title" className="text-white">Hero Title</Label>
            <Input
              id="hero-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="BrainPower AI: Invest in Cognitive Intelligence"
              className="bg-gray-800 border-gray-700 text-white text-xl font-bold"
            />
          </div>

          {/* Subtitle - Rich Text */}
          <div className="space-y-2">
            <Label className="text-white">Subtitle (Rich Text)</Label>
            <RichTextEditor
              content={subtitle}
              onChange={setSubtitle}
              placeholder="Describe your platform's value proposition..."
            />
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta-primary" className="text-white">Primary CTA Button</Label>
              <Input
                id="cta-primary"
                value={ctaPrimary}
                onChange={(e) => setCtaPrimary(e.target.value)}
                placeholder="Get Started"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta-secondary" className="text-white">Secondary CTA Button</Label>
              <Input
                id="cta-secondary"
                value={ctaSecondary}
                onChange={(e) => setCtaSecondary(e.target.value)}
                placeholder="Learn More"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
            <Button
              onClick={() => setIsPreviewOpen(true)}
              variant="outline"
              className="border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={() => handleSave("draft")}
              variant="outline"
              className="border-gray-700"
              disabled={upsertHero.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave("published")}
              className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-semibold"
              disabled={upsertHero.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              Publish Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <ContentPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title="Hero Section Preview"
        content={{ heroTitle: title, heroSubtitle: subtitle, ctaPrimary, ctaSecondary, mediaUrl, mediaType }}
      />
    </div>
  );
}
