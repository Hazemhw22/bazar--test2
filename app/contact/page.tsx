"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, MessageCircle, FileText, Shield, HelpCircle, Info, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type TabType = "about" | "contact" | "faq" | "terms" | "privacy"

export default function InformationalPages() {
  const [activeTab, setActiveTab] = useState<TabType>("about")

  const tabs = [
    { id: "about" as TabType, label: "About Us", icon: Info },
    { id: "contact" as TabType, label: "Contact Us", icon: MessageCircle },
    { id: "faq" as TabType, label: "FAQ", icon: HelpCircle },
    { id: "terms" as TabType, label: "Terms of Service", icon: FileText },
    { id: "privacy" as TabType, label: "Privacy Policy", icon: Shield },
  ]

  const faqData = [
    {
      question: "How do I create an account?",
      answer:
        "To create an account, click on the 'Sign Up' button in the top right corner of our website. Fill in your personal information including your name, email address, and create a secure password. You'll receive a confirmation email to verify your account.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely through our encrypted payment system.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping typically takes 3-5 business days within Israel. Express shipping is available for 1-2 business days. International shipping may take 7-14 business days depending on the destination.",
    },
    {
      question: "Can I return or exchange items?",
      answer:
        "Yes, we offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some restrictions apply to certain categories like electronics and personal care items.",
    },
    {
      question: "How do I track my order?",
      answer:
        "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'Orders' section.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes, our customer support team is available 24/7 via email, phone, and live chat. We're here to help with any questions or concerns you may have.",
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <div className="space-y-8 w-full ">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">About Vristo</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  Welcome to Vristo, your premier destination for online shopping in Israel. Founded in 2023, we've been
                  committed to providing our customers with the best shopping experience, offering a wide range of
                  high-quality products at competitive prices.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  Our mission is to make online shopping accessible, convenient, and enjoyable for everyone. We believe
                  that shopping should be more than just a transaction – it should be an experience that brings joy and
                  satisfaction to our customers.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full">
              <Card className="bg-background border border-gray-400 dark:border-blue-800 ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Info className="h-5 w-5 text-blue-600" />
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    To become the leading e-commerce platform in Israel, connecting customers with the products they
                    love while supporting local businesses and communities.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background  border border-gray-400 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Shield className="h-5 w-5 text-green-600" />
                    Our Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Customer satisfaction is our top priority</li>
                    <li>• Quality products at fair prices</li>
                    <li>• Fast and reliable delivery</li>
                    <li>• Excellent customer service</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Why Choose Vristo?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Secure Shopping</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Your personal and payment information is always protected with our advanced security measures.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Fast Delivery</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Quick and reliable delivery across Israel, with same-day delivery available in select areas.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">24/7 Support</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Our customer support team is always here to help you with any questions or concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "contact":
        return (
          <div className="space-y-8 w-full">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-6">Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-8">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 w-full">
              {/* Contact Form */}
              <Card className="bg-white dark:bg-gray-800  border border-gray-400 dark:border-blue-800 w-full">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-200">Send us a Message</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          First Name
                        </label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="bg-white dark:bg-gray-700  border border-gray-400 dark:border-blue-800"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="bg-white dark:bg-gray-700 border border-gray-400 dark:border-blue-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-white dark:bg-gray-700 border border-gray-400 dark:border-blue-800"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        placeholder="+972-50-123-4567"
                        className="bg-white dark:bg-gray-700 border border-gray-400 dark:border-blue-800"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        className="bg-white dark:bg-gray-700 border border-gray-400 dark:border-blue-800"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        rows={4}
                        placeholder="Tell us more about your inquiry..."
                        className="bg-white dark:bg-gray-700  border border-gray-400 dark:border-blue-800"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6 w-full">
                <Card className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-200">Get in Touch</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Here are the different ways you can reach us.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                        <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-200">Email Us</h4>
                        <p className="text-gray-700 dark:text-gray-300">support@vristo.com</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">We'll respond within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                        <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-200">Call Us</h4>
                        <p className="text-gray-700 dark:text-gray-300">0506667277</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                        <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-200">Visit Us</h4>
                        <p className="text-gray-700 dark:text-gray-300">Arad, Israel</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Monday - Friday, 9AM - 6PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-200">Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Monday - Friday</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Saturday</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Sunday</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">Closed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case "faq":
        return (
          <div className="space-y-8 w-full">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Frequently Asked Questions</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-8">
                Find answers to the most common questions about our services, shipping, returns, and more.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-gray-800 dark:text-gray-200">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Card className="bg-background border-blue-200 dark:border-blue-800 w-full">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">Still have questions?</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Can't find the answer you're looking for? Please contact our customer support team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => setActiveTab("contact")} className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "terms":
        return (
          <div className="space-y-8 w-full">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Terms of Service</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-8">Last updated: January 1, 2025</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 w-full">
              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">1. Acceptance of Terms</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  By accessing and using Vristo's website and services, you accept and agree to be bound by the terms
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">2. Use License</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Permission is granted to temporarily download one copy of the materials on Vristo's website for
                  personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of
                  title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">3. Account Terms</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  When you create an account with us, you must provide information that is accurate, complete, and
                  current at all times. You are responsible for safeguarding the password and for all activities that
                  occur under your account.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  4. Products and Services
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  All products and services are subject to availability. We reserve the right to discontinue any product
                  or service at any time. Prices for our products are subject to change without notice.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">5. Payment Terms</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Payment is due at the time of purchase. We accept various payment methods as displayed during
                  checkout. All payments are processed securely through our payment partners.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  6. Shipping and Delivery
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We will make every effort to deliver products within the estimated timeframe. However, delivery times
                  are estimates and not guaranteed. Risk of loss and title for products pass to you upon delivery to the
                  carrier.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">7. Returns and Refunds</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We offer a 30-day return policy for most items. Items must be returned in original condition. Refunds
                  will be processed within 5-10 business days after we receive the returned item.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">8. Contact Information</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at support@vristo.com or
                  call us at 0506667277.
                </p>
              </section>
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-8 w-full">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-8">Last updated: January 1, 2025</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 w-full">
              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  1. Information We Collect
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, make a
                  purchase, or contact us. This may include:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Name, email address, and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information</li>
                  <li>Purchase history and preferences</li>
                  <li>Communications with our customer service team</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  2. How We Use Your Information
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Process and fulfill your orders</li>
                  <li>Communicate with you about your account and orders</li>
                  <li>Provide customer support</li>
                  <li>Send you promotional communications (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">3. Information Sharing</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except as
                  described in this policy. We may share your information with trusted service providers who assist us
                  in operating our website and conducting our business.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">4. Data Security</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction. However, no method of transmission over the internet
                  is 100% secure.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">5. Cookies and Tracking</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your browsing experience, analyze website
                  traffic, and understand where our visitors are coming from. You can control cookie settings through
                  your browser preferences.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">6. Your Rights</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your personal information</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">7. Children's Privacy</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  8. Changes to This Policy
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the
                  new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">9. Contact Us</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@vristo.com or call
                  us at 0506667277.
                </p>
              </section>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="page-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-blue-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-200 mb-4">
                Vristo Information Center
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Your comprehensive guide to everything you need to know about Vristo - from our story and values to
                customer support, policies, and frequently asked questions. We're here to help you make the most of your
                shopping experience with us.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-blue-800 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="w-full">{renderContent()}</div>
      </div>
    </div>
  )
}
