import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Cookie, Database, Mail, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Hollow Knight Silksong',
  description: 'Privacy Policy for HollowKnightSilksong.org. Learn how we collect, use, and protect your personal information when you visit our website.',
  keywords: ['Privacy Policy', 'Data Protection', 'GDPR', 'Cookie Policy', 'Hollow Knight Silksong'],
  openGraph: {
    title: 'Privacy Policy - Silksong Wiki',
    description: 'Our commitment to protecting your privacy and personal data.',
    type: 'website',
  }
};

export default function PrivacyPage() {
  const lastUpdated = "September 15, 2025";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold fantasy-text mb-4 text-foreground">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Hollow Knight Silksong (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We operate the website located at 
                www.hollowknightsilksong.org (the &quot;Service&quot;). This Privacy Policy informs you about our policies 
                regarding the collection, use, and disclosure of personal data when you use our Service 
                and the choices you have associated with that data.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We use your data to provide and improve the Service. By using the Service, you agree 
                to the collection and use of information in accordance with this policy. Unless otherwise 
                defined in this Privacy Policy, terms used have the same meanings as in our Terms of Service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="w-6 h-6 text-green-500" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may collect personally identifiable information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Subscribe to our newsletter</li>
                  <li>Contact us through our contact forms</li>
                  <li>Participate in interactive features of our Service</li>
                  <li>Provide feedback or suggestions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Usage Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We automatically collect certain information about your device and usage patterns:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring/exit pages</li>
                  <li>Device and screen information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-purple-500" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our Service</li>
                <li>To monitor usage and detect technical issues</li>
                <li>To send you newsletters and updates (with your consent)</li>
                <li>To comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-orange-500" />
                Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Service and 
                store certain information. You can instruct your browser to refuse all cookies or to 
                indicate when a cookie is being sent.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Types of Cookies We Use:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Our Service may contain links to other sites that are not operated by us. We strongly 
                advise you to review the Privacy Policy of every site you visit.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">We use the following third-party services:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                  <li><strong>Google AdSense:</strong> For displaying relevant advertisements</li>
                  <li><strong>Supabase:</strong> For database and authentication services</li>
                  <li><strong>Vercel:</strong> For website hosting and deployment</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Withdraw consent:</strong> Withdraw your consent at any time</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-green-500" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <ul className="text-muted-foreground space-y-2">
                  <li>Email: listewart751@gmail.com</li>
                  <li>Website: www.hollowknightsilksong.org/contact</li>
                  <li>Address: Contact us through our website contact form</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. 
                You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}