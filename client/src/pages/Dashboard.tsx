import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Download,
  Calendar,
  Send,
  FileText,
  TrendingUp,
  Users,
  LogOut,
  CheckCircle,
  Star,
  Briefcase
} from 'lucide-react';
import { useLocation } from 'wouter';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user, signOut } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [selectedBand, setSelectedBand] = useState<string | null>(null);

  // Investment Bands Data
  const investmentBands = [
    {
      band: 'A',
      name: 'Early Supporter',
      minInvestment: '1,000 OMR',
      instrument: 'SAFE / Convertible',
      intendedFor: 'Early supporters',
      timeHorizon: '24–48 months',
      expectedMultiple: '5×–10×',
      useOfFunds: 'Product hardening, validation',
      benefits: ['Equity stake', 'Quarterly updates', 'Early access to beta features']
    },
    {
      band: 'B',
      name: 'Early Angel',
      minInvestment: '3,000 OMR',
      instrument: 'SAFE / Convertible',
      intendedFor: 'Early angels',
      timeHorizon: '24–36 months',
      expectedMultiple: '7×–12×',
      useOfFunds: 'Monetization engine, B2B pilots',
      benefits: ['Equity stake', 'Quarterly updates', 'Priority support', 'Investor community access']
    },
    {
      band: 'C',
      name: 'Strategic Angel',
      minInvestment: '5,000 OMR',
      instrument: 'Angel Equity / Lead SAFE',
      intendedFor: 'Strategic angels',
      timeHorizon: '18–36 months',
      expectedMultiple: '8×–15×',
      useOfFunds: 'Revenue acceleration',
      isPopular: true,
      benefits: ['Equity stake', 'Monthly updates', 'Advisory role', 'Networking events', 'Product roadmap input']
    },
    {
      band: 'D',
      name: 'Enterprise Partner',
      minInvestment: '10,000 OMR',
      instrument: 'Strategic Angel Equity',
      intendedFor: 'Enterprise partners',
      timeHorizon: '18–30 months',
      expectedMultiple: '10×–20×',
      useOfFunds: 'B2B contracts, integrations',
      benefits: ['Significant equity stake', 'Weekly updates', 'Board observer rights', 'Strategic partnership opportunities', 'Custom integration support']
    },
    {
      band: 'E',
      name: 'Lead Investor',
      minInvestment: '20,000 OMR',
      instrument: 'Strategic / Founding Lead',
      intendedFor: 'Lead investors',
      timeHorizon: '12–30 months',
      expectedMultiple: '12×–25×',
      useOfFunds: 'Market authority, enterprise scale',
      benefits: ['Major equity stake', 'Direct founder access', 'Board seat', 'Co-branding opportunities', 'First right of refusal on future rounds', 'Custom terms available']
    }
  ];

  // Capital Allocation Data
  const capitalAllocation = [
    { name: 'Product Development', value: 35, color: '#3b82f6' },
    { name: 'Global Marketing and Growth', value: 30, color: '#8b5cf6' },
    { name: 'Infrastructure and AI Costs', value: 15, color: '#06b6d4' },
    { name: 'Operations and Support', value: 10, color: '#10b981' },
    { name: 'Legal and Compliance', value: 5, color: '#f59e0b' },
    { name: 'Reserve Buffer', value: 5, color: '#ef4444' }
  ];

  // AI Evolution Timeline Data
  const aiEvolution = [
    { month: 'Jan', capability: 20 },
    { month: 'Feb', capability: 35 },
    { month: 'Mar', capability: 45 },
    { month: 'Apr', capability: 60 },
    { month: 'May', capability: 72 },
    { month: 'Jun', capability: 85 }
  ];

  // Documents Data
  const documents = [
    { name: 'Executive Summary', description: 'Comprehensive overview of BrainPower AI vision and strategy', icon: <FileText className="h-5 w-5" /> },
    { name: 'Product Roadmap', description: 'Detailed timeline of features and milestones', icon: <TrendingUp className="h-5 w-5" /> },
    { name: 'Financial Projections', description: '5-year financial model and revenue forecasts', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Legal Documents', description: 'SAFE agreements and investment terms', icon: <FileText className="h-5 w-5" /> }
  ];

  async function handleLogout() {
    try {
      await signOut();
      toast.success('Logged out successfully');
      setLocation('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  }

  function handleDownloadDocument(docName: string) {
    toast.success(`Downloading ${docName}...`);
    // In a real implementation, this would trigger an actual download
  }

  function handleRequestAllocation(band: string) {
    toast.success(`Allocation request for Band ${band} submitted successfully!`);
    // In a real implementation, this would send data to backend
  }

  function handleSubmitIntent(band: string) {
    toast.success(`Investment intent for Band ${band} submitted successfully!`);
    // In a real implementation, this would send data to backend
  }

  function handleScheduleCall() {
    toast.success('Call scheduling request submitted! Our team will contact you within 24 hours.');
    // In a real implementation, this would integrate with calendar API
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">BrainPower AI</h1>
            <Badge variant="outline">Investor Portal</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.user_metadata?.name || user?.email || 'Investor'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Welcome, {user?.user_metadata?.name?.split(' ')[0] || 'Investor'}!</h2>
          <p className="text-xl text-muted-foreground">
            Explore investment opportunities and access exclusive resources
          </p>
        </motion.div>

        <Tabs defaultValue="bands" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="bands">Investment Bands</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Investment Bands Tab */}
          <TabsContent value="bands" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investmentBands.map((band) => (
                <motion.div
                  key={band.band}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`h-full ${band.isPopular ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader>
                      {band.isPopular && (
                        <Badge className="w-fit mb-2">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      )}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold">Band {band.band}</span>
                        <span className="text-lg text-muted-foreground">{band.name}</span>
                      </div>
                      <div className="text-2xl font-bold text-primary mb-2">
                        {band.minInvestment}
                      </div>
                      <CardDescription>{band.intendedFor}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Instrument</p>
                        <p className="text-sm text-muted-foreground">{band.instrument}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Timeline</p>
                        <p className="text-sm text-muted-foreground">{band.timeHorizon}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Expected Multiple</p>
                        <p className="text-sm text-primary font-bold">{band.expectedMultiple}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-semibold mb-2">Benefits</p>
                        <ul className="space-y-2">
                          {band.benefits.slice(0, 3).map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-2 pt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full" onClick={() => setSelectedBand(band.band)}>
                              <Send className="mr-2 h-4 w-4" />
                              Request Allocation
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Allocation - Band {band.band}</DialogTitle>
                              <DialogDescription>
                                Submit your allocation request for {band.name} ({band.minInvestment})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="amount">Investment Amount (OMR)</Label>
                                <Input id="amount" type="number" placeholder="Enter amount" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="message">Additional Information</Label>
                                <Textarea id="message" placeholder="Tell us about your investment goals..." />
                              </div>
                              <Button className="w-full" onClick={() => handleRequestAllocation(band.band)}>
                                Submit Request
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full" onClick={() => setSelectedBand(band.band)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Submit Intent
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit Investment Intent - Band {band.band}</DialogTitle>
                              <DialogDescription>
                                Express your interest in investing in {band.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="intent-amount">Intended Investment (OMR)</Label>
                                <Input id="intent-amount" type="number" placeholder="Enter amount" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="timeline">Investment Timeline</Label>
                                <Input id="timeline" placeholder="e.g., Within 30 days" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="intent-message">Message</Label>
                                <Textarea id="intent-message" placeholder="Any questions or special requirements..." />
                              </div>
                              <Button className="w-full" onClick={() => handleSubmitIntent(band.band)}>
                                Submit Intent
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Schedule Call CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
              <CardHeader>
                <CardTitle className="text-2xl">Have Questions?</CardTitle>
                <CardDescription className="text-base">
                  Schedule a call with our founders to discuss investment opportunities and get your questions answered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule Call with Founders
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule a Call</DialogTitle>
                      <DialogDescription>
                        Request a call with our founding team to discuss your investment
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferred-date">Preferred Date</Label>
                        <Input id="preferred-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferred-time">Preferred Time</Label>
                        <Input id="preferred-time" type="time" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="call-topics">Topics to Discuss</Label>
                        <Textarea id="call-topics" placeholder="What would you like to discuss?" />
                      </div>
                      <Button className="w-full" onClick={handleScheduleCall}>
                        Submit Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {documents.map((doc) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                          {doc.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{doc.name}</CardTitle>
                          <CardDescription>{doc.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleDownloadDocument(doc.name)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-8">
            {/* Capital Allocation Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Capital Allocation</CardTitle>
                <CardDescription>How we plan to use the raised funds</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={capitalAllocation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {capitalAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Evolution Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">AI Capability Evolution</CardTitle>
                <CardDescription>Our progress in building advanced AI features</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={aiEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="capability" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="AI Capability (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Active Users', value: '10,000+', icon: <Users className="h-6 w-6" /> },
                { label: 'ARR', value: '$50K', icon: <TrendingUp className="h-6 w-6" /> },
                { label: 'MoM Growth', value: '40%', icon: <TrendingUp className="h-6 w-6" /> },
                { label: 'Retention', value: '95%', icon: <CheckCircle className="h-6 w-6" /> }
              ].map((metric) => (
                <Card key={metric.label}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2 text-primary">
                      {metric.icon}
                      <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                    </div>
                    <div className="text-3xl font-bold">{metric.value}</div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
