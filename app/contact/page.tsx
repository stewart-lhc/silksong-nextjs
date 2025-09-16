import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, MapPin, Clock, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Hollow Knight Silksong',
  description: 'Get in touch with the Hollow Knight Silksong team. We welcome your questions, feedback, and suggestions about our Hollow Knight: Silksong content.',
  keywords: ['Contact', 'Support', 'Feedback', 'Questions', 'Hollow Knight Silksong', 'Help'],
  openGraph: {
    title: 'Contact Us - Silksong Wiki',
    description: 'Get in touch with our team for questions, feedback, or support.',
    type: 'website',
  }
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold fantasy-text mb-4 text-foreground">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions, feedback, or suggestions? We&apos;d love to hear from you. Get in touch with our team.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Contact Options */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="card-enhanced text-center">
              <CardContent className="pt-6">
                <Mail className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-3">Send us an email</p>
                <a 
                  href="mailto:listewart751@gmail.com" 
                  className="text-primary hover:underline text-sm"
                >
                  listewart751@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="card-enhanced text-center">
              <CardContent className="pt-6">
                <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Feedback</h3>
                <p className="text-sm text-muted-foreground mb-3">Share your thoughts</p>
                <a 
                  href="mailto:listewart751@gmail.com" 
                  className="text-primary hover:underline text-sm"
                >
                  listewart751@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="card-enhanced text-center">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground mb-3">We typically respond</p>
                <p className="text-primary text-sm font-medium">Within 24-48 hours</p>
              </CardContent>
            </Card>

            <Card className="card-enhanced text-center">
              <CardContent className="pt-6">
                <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Community</h3>
                <p className="text-sm text-muted-foreground mb-3">Join our community</p>
                <a 
                  href="https://discord.gg/hollowknight" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Discord Server
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Send className="w-6 h-6 text-blue-500" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Enter your first name" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Enter your last name" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email address" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input 
                      id="subject" 
                      placeholder="What is this about?" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category"
                      className="w-full p-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select a category</option>
                      <option value="general">General Question</option>
                      <option value="content">Content Suggestion</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required 
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    * Required fields. We respect your privacy and will never share your information.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* FAQ and Information */}
            <div className="space-y-6">
              
              {/* Frequently Asked Questions */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Check out our FAQ section for quick answers to common questions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">How often is content updated?</h4>
                      <p className="text-sm text-muted-foreground">
                        We update our content regularly as new information about Hollow Knight: Silksong becomes available.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Can I contribute content?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes! We welcome community contributions. Contact us with your ideas or suggestions.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Is this an official Team Cherry website?</h4>
                      <p className="text-sm text-muted-foreground">
                        No, this is an unofficial fan site dedicated to providing information about Hollow Knight: Silksong.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" asChild>
                      <a href="/faq">View Full FAQ</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Other Ways to Connect */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle>Other Ways to Connect</CardTitle>
                  <CardDescription>
                    Follow us and connect with the community on social platforms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <a 
                      href="https://discord.gg/hollowknight"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 text-primary mr-3" />
                      <div>
                        <div className="font-medium text-foreground">Discord Community</div>
                        <div className="text-sm text-muted-foreground">Join the Hollow Knight community</div>
                      </div>
                    </a>

                    <a 
                      href="https://www.reddit.com/r/HollowKnight/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 text-primary mr-3" />
                      <div>
                        <div className="font-medium text-foreground">Reddit Community</div>
                        <div className="text-sm text-muted-foreground">r/HollowKnight discussions</div>
                      </div>
                    </a>

                    <a 
                      href="https://x.com/teamcherry"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 text-primary mr-3" />
                      <div>
                        <div className="font-medium text-foreground">Follow Team Cherry</div>
                        <div className="text-sm text-muted-foreground">Official updates on X</div>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Business Inquiries */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle>Business Inquiries</CardTitle>
                  <CardDescription>
                    For partnerships, sponsorships, or business-related questions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                      <a 
                        href="mailto:listewart751@gmail.com" 
                        className="text-primary hover:underline"
                      >
                        listewart751@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                      <a 
                        href="mailto:partnerships@silksong.wiki" 
                        className="text-primary hover:underline"
                      >
                        partnerships@silksong.wiki
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>

          {/* Additional Information */}
          <Card className="mt-12 card-enhanced">
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">About Our Response</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• We aim to respond to all inquiries within 24-48 hours</li>
                    <li>• Complex questions may require additional time</li>
                    <li>• Check your spam folder if you don&apos;t receive a response</li>
                    <li>• Include relevant details to help us assist you better</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Privacy & Data</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Your information is handled according to our Privacy Policy</li>
                    <li>• We never share personal information with third parties</li>
                    <li>• Contact forms are secured with encryption</li>
                    <li>• You can request data deletion at any time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}