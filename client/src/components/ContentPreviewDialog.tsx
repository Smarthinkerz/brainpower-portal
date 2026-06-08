import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState } from 'react';

interface PreviewContent {
  heroTitle?: string;
  heroSubtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  concepts?: Array<{ title: string; description: string; mediaUrl?: string }>;
  investorContent?: { title: string; description: string; benefits?: string[] };
}

interface ContentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: PreviewContent;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportWidths: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function ContentPreviewDialog({ open, onOpenChange, title, content }: ContentPreviewDialogProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a1a] border-gray-800 max-w-6xl w-full max-h-[92vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-white text-lg">{title}</DialogTitle>
              <Badge variant="outline" className="border-[#00d4ff] text-[#00d4ff] text-xs">Preview</Badge>
            </div>
            {/* Viewport switcher */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-md transition-colors ${viewport === 'desktop' ? 'bg-[#00d4ff] text-black' : 'text-gray-400 hover:text-white'}`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-md transition-colors ${viewport === 'tablet' ? 'bg-[#00d4ff] text-black' : 'text-gray-400 hover:text-white'}`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-md transition-colors ${viewport === 'mobile' ? 'bg-[#00d4ff] text-black' : 'text-gray-400 hover:text-white'}`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview area */}
        <div className="flex-1 overflow-auto bg-gray-950 p-4 flex justify-center">
          <div
            className="transition-all duration-300 overflow-auto"
            style={{ width: viewportWidths[viewport], maxWidth: '100%' }}
          >
            {/* Simulated website preview */}
            <div className="bg-[#050510] rounded-lg overflow-hidden border border-gray-800 min-h-[400px]">

              {/* Hero Section */}
              {(content.heroTitle || content.heroSubtitle) && (
                <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
                  {/* Background */}
                  {content.mediaUrl ? (
                    content.mediaType === 'video' ? (
                      <video src={content.mediaUrl} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    ) : (
                      <img src={content.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-[#050510] to-cyan-900/20" />
                  )}
                  {/* Neural network dots effect */}
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #00d4ff 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <div className="relative z-10 text-center px-6 py-16">
                    {content.heroTitle && (
                      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {content.heroTitle}
                      </h1>
                    )}
                    {content.heroSubtitle && (
                      <div
                        className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content.heroSubtitle }}
                      />
                    )}
                    {(content.ctaPrimary || content.ctaSecondary) && (
                      <div className="flex flex-wrap gap-4 justify-center">
                        {content.ctaPrimary && (
                          <Button className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-semibold px-6 py-5">
                            {content.ctaPrimary}
                          </Button>
                        )}
                        {content.ctaSecondary && (
                          <Button variant="outline" className="border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10 px-6 py-5">
                            {content.ctaSecondary}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Concepts Section */}
              {content.concepts && content.concepts.length > 0 && (
                <section className="px-6 py-12 bg-gray-900/30">
                  <h2 className="text-2xl font-bold text-white text-center mb-8">Core Concepts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.concepts.map((concept, i) => (
                      <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-[#00d4ff]/50 transition-colors">
                        {concept.mediaUrl && (
                          <img src={concept.mediaUrl} alt={concept.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                        )}
                        <h3 className="text-lg font-semibold text-white mb-2">{concept.title}</h3>
                        <p className="text-gray-400 text-sm">{concept.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Investor Section */}
              {content.investorContent && (
                <section className="px-6 py-12">
                  <h2 className="text-2xl font-bold text-white mb-4">{content.investorContent.title}</h2>
                  <p className="text-gray-300 mb-6">{content.investorContent.description}</p>
                  {content.investorContent.benefits && (
                    <ul className="space-y-3">
                      {content.investorContent.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300">
                          <span className="text-[#00d4ff] font-bold mt-0.5">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {/* Empty state */}
              {!content.heroTitle && !content.concepts?.length && !content.investorContent && (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>No content to preview yet. Fill in the editor fields to see a preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-800 flex justify-end flex-shrink-0">
          <Button variant="outline" className="border-gray-700 text-gray-300" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
