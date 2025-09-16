import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, FileText, AlertCircle, Shield, Users, Gavel } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - Hollow Knight Silksong',
  description: 'Terms of Service for HollowKnightSilksong.org. Please read these terms carefully before using our website and services.',
  keywords: ['Terms of Service', 'Terms and Conditions', 'Website Terms', 'Legal Terms', 'Hollow Knight Silksong'],
  openGraph: {
    title: 'Terms of Service - Silksong Wiki',
    description: 'Terms and conditions governing the use of Silksong Wiki.',
    type: 'website',
  }
};

export default function TermsPage() {
  const lastUpdated = "September 15, 2025";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold fantasy-text mb-4 text-foreground">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using our website and services.
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
                <Scale className="w-6 h-6 text-blue-500" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) govern your use of Hollow Knight Silksong website located at 
                www.hollowknightsilksong.org (the &quot;Service&quot;) operated by Hollow Knight Silksong (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
                with any part of these terms, then you may not access the Service. These Terms apply to 
                all visitors, users, and others who access or use the Service.
              </p>
            </CardContent>
          </Card>

          {/* Website Usage */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-500" />
                Use of Our Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Permitted Use</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may use our website for lawful purposes only. You agree to use the Service in a manner consistent with any applicable laws and regulations.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Access and view content for personal, non-commercial use</li>
                  <li>Share links to our content on social media and other platforms</li>
                  <li>Subscribe to our newsletter and updates</li>
                  <li>Contact us with questions, feedback, or suggestions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Prohibited Activities</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Violating any applicable local, state, national, or international law</li>
                  <li>Transmitting any material that is defamatory, offensive, or otherwise objectionable</li>
                  <li>Attempting to gain unauthorized access to our systems or networks</li>
                  <li>Interfering with or disrupting the Service or servers</li>
                  <li>Using automated systems to access the Service without permission</li>
                  <li>Copying, reproducing, or distributing our content without permission</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-500" />
                Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Our Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Service and its original content, features, and functionality are and will remain 
                  the exclusive property of Silksong Wiki and its licensors. The Service is protected 
                  by copyright, trademark, and other laws.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Hollow Knight: Silksong</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hollow Knight: Silksong is a trademark of Team Cherry. This website is an unofficial 
                  fan site and is not affiliated with, endorsed by, or sponsored by Team Cherry. All 
                  game content, images, and trademarks are the property of their respective owners.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Fair Use</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our use of game assets, screenshots, and promotional materials falls under fair use 
                  for educational, informational, and commentary purposes. We respect the intellectual 
                  property rights of all content creators.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Content */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-500" />
                User-Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Our Service may allow you to post, link, store, share and otherwise make available 
                certain information, text, graphics, videos, or other material (&quot;Content&quot;). You are 
                responsible for the Content that you post to the Service.
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Content Guidelines</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>You retain ownership of your Content</li>
                  <li>You grant us a license to use, display, and distribute your Content</li>
                  <li>You are responsible for ensuring your Content complies with applicable laws</li>
                  <li>We reserve the right to remove Content that violates these Terms</li>
                  <li>Content must be respectful and appropriate for all audiences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                Disclaimers and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Information Accuracy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The information on this website is provided on an &quot;as is&quot; basis. We make every effort 
                  to ensure that information is accurate and up-to-date, but we do not guarantee the 
                  accuracy, completeness, or reliability of any information.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Service Availability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We do not guarantee that the Service will be available at all times. We may experience 
                  hardware, software, or other problems or need to perform maintenance related to the Service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">External Links</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our Service may contain links to third-party web sites or services that are not owned 
                  or controlled by us. We have no control over and assume no responsibility for the content, 
                  privacy policies, or practices of any third-party websites or services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs 
                your use of the Service, to understand our practices.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Privacy Policy:</strong> Our detailed Privacy Policy can be found at 
                  <a href="/privacy" className="text-primary hover:underline ml-1">
                    www.silksong.wiki/privacy
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Gavel className="w-6 h-6 text-red-500" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will try to provide at least 30 days notice prior to any new 
                terms taking effect.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What constitutes a material change will be determined at our sole discretion. By continuing 
                to access or use our Service after those revisions become effective, you agree to be bound 
                by the revised terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <ul className="text-muted-foreground space-y-2">
                  <li>Email: listewart751@gmail.com</li>
                  <li>Website: www.hollowknightsilksong.org/contact</li>
                  <li>Contact Form: Available on our contact page</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction where our 
                service is hosted, without regard to its conflict of law provisions. Our failure to enforce 
                any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}