import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Upload, 
  Image, 
  BarChart3, 
  Settings,
  Bell,
  Shield,
  Calendar,
  Eye,
  Check,
  X,
  Download,
  Edit,
  Trash2,
  Plus,
  Mail,
  TrendingUp,
  MessageSquare,
  MousePointerClick
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { HeroSectionEditor } from "@/components/admin/HeroSectionEditor";
import { ConceptsEditor } from "@/components/admin/ConceptsEditor";
import { InvestorPageEditor } from "@/components/admin/InvestorPageEditor";
import { ImageCropDialog } from "@/components/ImageCropDialog";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const isAdmin = !!user;

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [authLoading, user, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0b1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
          <div className="text-white text-sm">Verifying access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0b1e] relative">
      {/* Neural Head Background */}
      <div 
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(/neural-head.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/brain-logo_f2be5a6a.png" alt="BrainPower AI" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">BrainPower AI Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/booking-admin">
                <Button variant="outline" size="sm" className="border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff]/10 text-xs">
                  📅 Booking Admin
                </Button>
              </Link>
              <NotificationBell />
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                  <Badge variant="outline" className="text-xs border-[#00d4ff] text-[#00d4ff]">
                    ADMIN
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <FileText className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="investors" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Investors
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <Upload className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <Image className="w-4 h-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="interest" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <TrendingUp className="h-4 w-4 mr-2" />
              Interest Tracker
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagementTab />
          </TabsContent>

          <TabsContent value="investors">
            <InvestorManagementTab />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManagementTab />
          </TabsContent>

          <TabsContent value="media">
            <MediaLibraryTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
          <TabsContent value="interest">
            <InvestorInterestTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Notification Bell Component
function NotificationBell() {
  const { data: notifications } = trpc.admin.notifications.list.useQuery({ unreadOnly: true });
  const markAllRead = trpc.admin.notifications.markAllRead.useMutation();

  const unreadCount = notifications?.length || 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-gray-400 hover:text-white"
        onClick={() => {
          if (unreadCount > 0) {
            markAllRead.mutate();
            toast.success("All notifications marked as read");
          }
        }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#b24bf3] rounded-full text-xs flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();

  if (isLoading) {
    return <div className="text-white">Loading stats...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">{stats?.stats.totalInvestors || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#b24bf3]">{stats?.stats.pendingInvestors || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">{stats?.stats.totalDocuments || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">{stats?.stats.totalEvents || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">Latest admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-start gap-4 p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{log.action.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Content Management Tab
function ContentManagementTab() {
  const [contentSection, setContentSection] = useState<"hero" | "concepts" | "investor">("hero");

  return (
    <div className="space-y-6">
      {/* Content Section Selector */}
      <div className="flex gap-4 border-b border-gray-800 pb-4">
        <Button
          variant={contentSection === "hero" ? "default" : "outline"}
          onClick={() => setContentSection("hero")}
          className={contentSection === "hero" ? "bg-[#00d4ff] text-black" : "border-gray-700 text-gray-400"}
        >
          Hero Section
        </Button>
        <Button
          variant={contentSection === "concepts" ? "default" : "outline"}
          onClick={() => setContentSection("concepts")}
          className={contentSection === "concepts" ? "bg-[#00d4ff] text-black" : "border-gray-700 text-gray-400"}
        >
          Concepts
        </Button>
        <Button
          variant={contentSection === "investor" ? "default" : "outline"}
          onClick={() => setContentSection("investor")}
          className={contentSection === "investor" ? "bg-[#00d4ff] text-black" : "border-gray-700 text-gray-400"}
        >
          Investor Page
        </Button>
      </div>

      {/* Render appropriate editor based on selection */}
      {contentSection === "hero" && <HeroSectionEditor />}
      {contentSection === "concepts" && <ConceptsEditor />}
      {contentSection === "investor" && <InvestorPageEditor />}
    </div>
  );
}

// Investor Management Tab
function InvestorManagementTab() {
  const { data: investors, refetch } = trpc.admin.investors.list.useQuery();
  const approveMutation = trpc.admin.investors.approve.useMutation();
  const rejectMutation = trpc.admin.investors.reject.useMutation();

  const handleApprove = async (id: number, accessLevel: string) => {
    try {
      await approveMutation.mutateAsync({ id, accessLevel: accessLevel as any });
      toast.success("Investor approved successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to approve investor");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this investor?")) return;
    
    try {
      await rejectMutation.mutateAsync({ id });
      toast.success("Investor rejected");
      refetch();
    } catch (error) {
      toast.error("Failed to reject investor");
    }
  };

  const pendingInvestors = investors?.filter((inv: any) => inv.status === 'pending') || [];
  const approvedInvestors = investors?.filter((inv: any) => inv.status === 'approved') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Investor Management</h2>
        <p className="text-gray-400 mt-1">Approve and manage investor access</p>
      </div>

      {/* Pending Approvals */}
      {pendingInvestors.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Pending Approvals ({pendingInvestors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvestors.map((investor: any) => (
                <div key={investor.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white">{investor.name}</h3>
                    <p className="text-sm text-gray-400">{investor.email}</p>
                    {investor.company && (
                      <p className="text-xs text-gray-500 mt-1">{investor.company}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {new Date(investor.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleApprove(investor.id, 'full')}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(investor.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Investors */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Approved Investors ({approvedInvestors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {approvedInvestors.length > 0 ? (
              approvedInvestors.map((investor: any) => (
                <div key={investor.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">{investor.name}</h3>
                    <p className="text-sm text-gray-400">{investor.email}</p>
                  </div>
                  <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50">
                    {investor.accessLevel}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No approved investors yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Document Management Tab
function DocumentManagementTab() {
  const { data: documents, refetch } = trpc.admin.documents.list.useQuery();
  const deleteMutation = trpc.admin.documents.delete.useMutation();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Document deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Document Management</h2>
          <p className="text-gray-400 mt-1">Manage investor documents</p>
        </div>
        <Button className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4">
        {documents && documents.length > 0 ? (
          documents.map((doc: any) => (
            <Card key={doc.id} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                      <Badge variant="outline" className="text-[#00d4ff] border-[#00d4ff]">
                        {doc.documentType.replace('_', ' ')}
                      </Badge>
                      <Badge className="bg-[#b24bf3]/20 text-[#b24bf3] border-[#b24bf3]/50">
                        {doc.accessLevel}
                      </Badge>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-gray-400 mb-2">{doc.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(doc.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-12 text-center">
              <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No documents uploaded yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Media Library Tab
function MediaLibraryTab() {
  const { data: media, refetch } = trpc.admin.media.list.useQuery();
  const uploadMedia = trpc.admin.media.upload.useMutation();
  const deleteMedia = trpc.admin.media.delete.useMutation();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [uploadData, setUploadData] = useState<{
    title: string;
    description: string;
    altText: string;
    file: File | null;
    mediaType: "image" | "video";
  }>({ title: "", description: "", altText: "", file: null, mediaType: "image" });

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!media) return;
    if (selectedIds.size === media.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(media.map((m: any) => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected item${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    setIsBulkDeleting(true);
    let successCount = 0;
    for (const id of Array.from(selectedIds)) {
      try {
        await deleteMedia.mutateAsync({ id });
        successCount++;
      } catch {}
    }
    toast.success(`Deleted ${successCount} item${successCount > 1 ? 's' : ''}`);
    setSelectedIds(new Set());
    setIsBulkDeleting(false);
    refetch();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mediaType = file.type.startsWith("image/") ? "image" : "video";
      setUploadData({ ...uploadData, file, mediaType, title: file.name });

      // If it's an image, offer to crop it
      if (mediaType === "image") {
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImageForCrop(reader.result as string);
          setIsCropDialogOpen(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCropComplete = async (croppedBlob: Blob, fileName: string) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
    setUploadData({ ...uploadData, file: croppedFile });
    setIsCropDialogOpen(false);
    toast.success('Image ready for upload');
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      toast.error("Please select a file");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        
        await uploadMedia.mutateAsync({
          title: uploadData.title,
          description: uploadData.description,
          altText: uploadData.altText,
          fileData: base64,
          fileName: uploadData.file!.name,
          mimeType: uploadData.file!.type,
          mediaType: uploadData.mediaType,
        });

        toast.success("Media uploaded successfully!");
        setIsUploadDialogOpen(false);
        setUploadData({ title: "", description: "", altText: "", file: null, mediaType: "image" });
        refetch();
      };
      reader.readAsDataURL(uploadData.file);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload media");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this media file?")) return;

    try {
      await deleteMedia.mutateAsync({ id });
      toast.success("Media deleted");
      refetch();
    } catch (error: any) {
      toast.error("Failed to delete media");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Library</h2>
          <p className="text-gray-400 mt-1">Manage images and videos</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black">
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Upload Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="media-file" className="text-white">File</Label>
                <Input
                  id="media-file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media-title" className="text-white">Title</Label>
                <Input
                  id="media-title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media-description" className="text-white">Description</Label>
                <Textarea
                  id="media-description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media-alt" className="text-white">Alt Text</Label>
                <Input
                  id="media-alt"
                  value={uploadData.altText}
                  onChange={(e) => setUploadData({ ...uploadData, altText: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-700"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
                  onClick={handleUpload}
                  disabled={uploadMedia.isPending || !uploadData.file}
                >
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={isCropDialogOpen}
        onOpenChange={setIsCropDialogOpen}
        imageUrl={selectedImageForCrop}
        onCropComplete={handleCropComplete}
      />

      {/* Bulk action toolbar - shown when items are selected */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg px-4 py-3">
          <span className="text-[#00d4ff] font-medium">
            {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300"
              onClick={() => setSelectedIds(new Set())}
            >
              Deselect All
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isBulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size} Selected`}
            </Button>
          </div>
        </div>
      )}

      {/* Select All row */}
      {media && media.length > 0 && (
        <div className="flex items-center gap-2 pb-1">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedIds.size === media.length && media.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-[#00d4ff] cursor-pointer"
          />
          <label htmlFor="select-all" className="text-sm text-gray-400 cursor-pointer select-none">
            {selectedIds.size === media.length ? 'Deselect all' : 'Select all'}
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media && media.length > 0 ? (
          media.map((item: any) => (
            <Card
              key={item.id}
              className={`bg-gray-900/50 border overflow-hidden cursor-pointer transition-all ${
                selectedIds.has(item.id) ? 'border-[#00d4ff] ring-1 ring-[#00d4ff]/50' : 'border-gray-800 hover:border-gray-600'
              }`}
              onClick={() => toggleSelect(item.id)}
            >
              <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
                {item.mediaType === 'image' ? (
                  <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-12 h-12 text-gray-600" />
                )}
                {/* Checkbox overlay */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 accent-[#00d4ff] cursor-pointer"
                  />
                </div>
                {selectedIds.has(item.id) && (
                  <div className="absolute inset-0 bg-[#00d4ff]/10 pointer-events-none" />
                )}
              </div>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.mediaType}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="text-red-400 hover:text-red-300 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full bg-gray-900/50 border-gray-800">
            <CardContent className="p-12 text-center">
              <Image className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No media files yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Analytics Tab
function AnalyticsTab() {
  const { data: analytics } = trpc.admin.analytics.summary.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-gray-400 mt-1">Track engagement and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">{analytics?.totalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">{analytics?.totalInvestors || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#b24bf3]">{analytics?.pendingInvestors || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">{analytics?.totalDocuments || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Coming Soon</CardTitle>
          <CardDescription className="text-gray-400">
            Detailed analytics charts and reports will be available here
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// Investor Interest Tracker Tab
function InvestorInterestTab() {
  const { data: stats, isLoading: statsLoading } = trpc.investor.getInterestStats.useQuery();
  const { data: contactsData, isLoading: contactsLoading } = trpc.investor.getContacts.useQuery({ limit: 50, offset: 0 });
  const updateStatus = trpc.investor.updateContactStatus.useMutation({
    onSuccess: () => { toast.success('Status updated'); utils.investor.getContacts.invalidate(); },
  });
  const utils = trpc.useUtils();

  const EVENT_LABELS: Record<string, string> = {
    schedule_call_click: 'Schedule a Call Clicks',
    download_brief_click: 'Download Brief Clicks',
    contact_form_submit: 'Contact Form Submits',
    faq_open: 'FAQ Opens',
    invest_now_click: 'Invest Now Clicks',
    page_view: 'Page Views',
  };

  const STATUS_COLORS: Record<string, string> = {
    new: 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/40',
    contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    in_progress: 'bg-[#b24bf3]/20 text-[#b24bf3] border-[#b24bf3]/40',
    closed: 'bg-gray-600/20 text-gray-400 border-gray-600/40',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Investor Interest Tracker</h2>
        <p className="text-gray-400 mt-1">Monitor CTA engagement and contact form submissions from the Investors portal</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">{statsLoading ? '—' : (stats?.totalContacts ?? 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />New (Unread)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#b24bf3]">{statsLoading ? '—' : (stats?.newContacts ?? 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><MousePointerClick className="h-3.5 w-3.5" />Call Clicks (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">
              {statsLoading ? '—' : (stats?.recentEvents?.find(e => e.eventType === 'schedule_call_click')?.count ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400 flex items-center gap-1.5"><Download className="h-3.5 w-3.5" />Brief Downloads (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00d4ff]">
              {statsLoading ? '—' : (stats?.recentEvents?.find(e => e.eventType === 'download_brief_click')?.count ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All-time event breakdown */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[#00d4ff]" />All-Time CTA Engagement</CardTitle>
          <CardDescription className="text-gray-400">Total interactions tracked from the Investors portal</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : stats?.allEvents && stats.allEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.allEvents.map((ev: any) => (
                <div key={ev.eventType} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-gray-300 text-sm">{EVENT_LABELS[ev.eventType] ?? ev.eventType}</span>
                  <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/40 font-mono">{ev.count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No events tracked yet. Events will appear here once investors interact with the portal.</p>
          )}
        </CardContent>
      </Card>

      {/* Contact form submissions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Mail className="h-5 w-5 text-[#b24bf3]" />Contact Form Submissions</CardTitle>
          <CardDescription className="text-gray-400">Investor enquiries submitted via the portal contact form</CardDescription>
        </CardHeader>
        <CardContent>
          {contactsLoading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : contactsData?.contacts && contactsData.contacts.length > 0 ? (
            <div className="space-y-3">
              {contactsData.contacts.map((c: any) => (
                <div key={c.id} className="p-4 bg-gray-800/30 rounded-lg border border-white/5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-white">{c.name}</p>
                      <p className="text-sm text-gray-400">{c.email}{c.company ? ` · ${c.company}` : ''}</p>
                      {c.investmentRange && <p className="text-xs text-[#00d4ff] mt-0.5">Range: {c.investmentRange}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={STATUS_COLORS[c.status] ?? ''}>{c.status.replace('_', ' ')}</Badge>
                      <select
                        className="text-xs bg-gray-800 border border-white/10 text-gray-300 rounded px-2 py-1"
                        value={c.status}
                        onChange={(e) => updateStatus.mutate({ id: c.id, status: e.target.value as any })}
                      >
                        <option value="new">new</option>
                        <option value="contacted">contacted</option>
                        <option value="in_progress">in progress</option>
                        <option value="closed">closed</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{c.message}</p>
                  <p className="text-xs text-gray-600 mt-2">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No contact form submissions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  const { data: users } = trpc.admin.users.list.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 mt-1">System configuration and user management</p>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">User Management</CardTitle>
          <CardDescription className="text-gray-400">Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users && users.length > 0 ? (
              users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">{user.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50">
                    {user.role}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
