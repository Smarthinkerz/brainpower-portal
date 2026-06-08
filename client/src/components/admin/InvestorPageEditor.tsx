import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Eye, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function InvestorPageEditor() {
  const { data: pageData, isLoading, refetch } = trpc.admin.content.get.useQuery({ blockKey: "investor_page_intro" });
  const upsertPage = trpc.admin.content.upsert.useMutation();

  const metadata = (pageData?.metadata as any) || {};
  const [title, setTitle] = useState(pageData?.title || "");
  const [introText, setIntroText] = useState(pageData?.content || "");
  const [investmentOpportunity, setInvestmentOpportunity] = useState(metadata.investmentOpportunity || "");
  const [whyInvest, setWhyInvest] = useState(metadata.whyInvest || "");
  const [roadmap, setRoadmap] = useState(metadata.roadmap || "");
  const [team, setTeam] = useState(metadata.team || "");
  const [contactEmail, setContactEmail] = useState(metadata.contactEmail || "");
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = async (status: "draft" | "published") => {
    try {
      await upsertPage.mutateAsync({
        blockKey: "investor_page_intro",
        blockType: "investor_block",
        title,
        content: introText,
        metadata: {
          investmentOpportunity,
          whyInvest,
          roadmap,
          team,
          contactEmail,
        },
        status,
      });

      toast.success(status === "published" ? "Investor page published!" : "Changes saved as draft");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading investor page...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Investor Public Page Management</CardTitle>
          <CardDescription className="text-gray-400">
            Edit content shown to potential investors on the public-facing investor page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Page Title */}
          <div className="space-y-2">
            <Label htmlFor="page-title" className="text-white">Page Title</Label>
            <Input
              id="page-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Investment Opportunity"
              className="bg-gray-800 border-gray-700 text-white text-2xl font-bold"
            />
          </div>

          {/* Intro Text */}
          <div className="space-y-2">
            <Label htmlFor="intro-text" className="text-white">Introduction</Label>
            <Textarea
              id="intro-text"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="Welcome to BrainPower AI's investor portal..."
              rows={4}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Investment Opportunity */}
          <div className="space-y-2">
            <Label htmlFor="investment-opportunity" className="text-white">Investment Opportunity</Label>
            <Textarea
              id="investment-opportunity"
              value={investmentOpportunity}
              onChange={(e) => setInvestmentOpportunity(e.target.value)}
              placeholder="Describe the investment opportunity, funding goals, and use of funds..."
              rows={6}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Why Invest */}
          <div className="space-y-2">
            <Label htmlFor="why-invest" className="text-white">Why Invest in BrainPower AI</Label>
            <Textarea
              id="why-invest"
              value={whyInvest}
              onChange={(e) => setWhyInvest(e.target.value)}
              placeholder="Key value propositions, market opportunity, competitive advantages..."
              rows={6}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Roadmap */}
          <div className="space-y-2">
            <Label htmlFor="roadmap" className="text-white">Product Roadmap</Label>
            <Textarea
              id="roadmap"
              value={roadmap}
              onChange={(e) => setRoadmap(e.target.value)}
              placeholder="Timeline, milestones, and future plans..."
              rows={6}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label htmlFor="team" className="text-white">Team & Advisors</Label>
            <Textarea
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Key team members, advisors, and their backgrounds..."
              rows={6}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-white">Contact Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="investors@brainpower.ai"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => setIsPreview(!isPreview)}
              variant="outline"
              className="border-gray-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "Hide" : "Show"} Preview
            </Button>
            <Button
              onClick={() => handleSave("draft")}
              variant="outline"
              className="border-gray-700"
              disabled={upsertPage.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave("published")}
              className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
              disabled={upsertPage.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              Publish Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {isPreview && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Preview</CardTitle>
            <CardDescription className="text-gray-400">
              How your investor page will appear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent">
                {title || "Investment Opportunity"}
              </h1>
              <p className="text-gray-300 text-lg">{introText || "Introduction text will appear here"}</p>
            </div>

            {investmentOpportunity && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Investment Opportunity</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{investmentOpportunity}</p>
              </div>
            )}

            {whyInvest && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Why Invest in BrainPower AI</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{whyInvest}</p>
              </div>
            )}

            {roadmap && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Product Roadmap</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{roadmap}</p>
              </div>
            )}

            {team && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Team & Advisors</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{team}</p>
              </div>
            )}

            {contactEmail && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Contact Us</h2>
                <p className="text-gray-300">
                  For investment inquiries, please contact:{" "}
                  <a href={`mailto:${contactEmail}`} className="text-[#00d4ff] hover:underline">
                    {contactEmail}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
