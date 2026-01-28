import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "The 2026 Merchant Yield Map | LinkMedic Intel",
  description: "A side-by-side comparison of affiliate commission rates and cookie windows. Bookmark this and reference it every time you add links to a video.",
  keywords: ["affiliate commission rates", "cookie windows", "amazon alternatives", "b&h photo affiliate", "impact affiliate", "rakuten affiliate"],
};

export default function MerchantYieldMap() {
  return (
    <div className="min-h-screen bg-yt-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-yt-dark/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-yt-light">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
            <Link href="/intel" className="text-white">Intel Blog</Link>
          </nav>
          <Link
            href="/login"
            className="bg-profit-green text-black px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <Link href="/intel" className="inline-flex items-center gap-2 text-sm text-yt-light hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Intel Blog
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 pb-20">
        <div className="mb-6">
          <span className="px-3 py-1 bg-profit-green/20 text-profit-green text-xs font-medium rounded-full">
            Reference
          </span>
          <span className="ml-4 text-sm text-yt-light/70">January 2026 &middot; 6 min read</span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-white mb-6">
          THE 2026 MERCHANT YIELD MAP: WHO PAYS WHAT (AND WHY IT MATTERS)
        </h1>

        <p className="text-xl text-yt-light mb-8 p-4 bg-yt-gray/50 border-l-4 border-profit-green rounded-r-lg">
          <strong className="text-white">TL;DR:</strong> A side-by-side comparison of affiliate commission rates and cookie windows. Bookmark this. Reference it every time you add links to a video.
        </p>

        <div className="prose prose-invert prose-lg max-w-none">

          <h2 className="font-display text-2xl text-white mt-12 mb-4">WHY THIS MAP EXISTS</h2>
          <p className="text-yt-light">Here&apos;s a conversation that happens way too often:</p>
          <blockquote className="border-l-4 border-emergency-red pl-4 text-yt-light italic my-6">
            &quot;I recommended a $3,000 camera setup and made $30.&quot;
          </blockquote>
          <p className="text-yt-light">
            Yeah. That&apos;s Amazon&apos;s 1% electronics rate in action.
          </p>
          <p className="text-yt-light">
            The same recommendation through B&H Photo? <strong className="text-profit-green">$150-$240</strong>. Same video. Same audience. 5x to 8x more money.
          </p>
          <p className="text-yt-light">
            Most creators don&apos;t know these alternatives exist. This map fixes that.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">HOW TO READ THIS MAP</h2>
          <ul className="text-yt-light space-y-2 list-disc list-inside mb-6">
            <li><strong className="text-white">Baseline</strong> = What Amazon pays (your &quot;default&quot; option)</li>
            <li><strong className="text-white">Strategic Alternative</strong> = A better-paying merchant for that category</li>
            <li><strong className="text-white">Yield Increase</strong> = How much more you could earn (percentage)</li>
            <li><strong className="text-white">Cookie Window</strong> = How long after someone clicks your link you still get credit</li>
          </ul>
          <p className="text-yt-light">
            That last one matters more than you think. Amazon gives you 24 hours. If someone clicks your link, sleeps on it, and buys the next day? You get nothing. B&H gives you 30 days.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">THE 2026 MERCHANT YIELD MAP</h2>

          <h3 className="text-xl font-semibold tracking-wide text-white mt-8 mb-4">Tech & Gaming</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-yt-gray/70">
                <tr>
                  <th className="text-left p-3 text-yt-light font-medium">What You&apos;re Linking</th>
                  <th className="text-left p-3 text-emergency-red font-medium">Amazon Pays</th>
                  <th className="text-left p-3 text-white font-medium">Better Option</th>
                  <th className="text-left p-3 text-profit-green font-medium">They Pay</th>
                  <th className="text-left p-3 text-yt-light font-medium">Cookie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Cameras & Lenses</td><td className="p-3 text-emergency-red">1-4%</td><td className="p-3 text-white">B&H Photo</td><td className="p-3 text-profit-green">2-8%</td><td className="p-3 text-yt-light">30 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Laptops & PCs</td><td className="p-3 text-emergency-red">1-2.5%</td><td className="p-3 text-white">Adorama</td><td className="p-3 text-profit-green">2-5%</td><td className="p-3 text-yt-light">30 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Gaming Consoles</td><td className="p-3 text-emergency-red">1%</td><td className="p-3 text-white">GameStop (Rakuten)</td><td className="p-3 text-profit-green">2-4%</td><td className="p-3 text-yt-light">7 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">PC Components</td><td className="p-3 text-emergency-red">1-2.5%</td><td className="p-3 text-white">Newegg (Impact)</td><td className="p-3 text-profit-green">2.5-5%</td><td className="p-3 text-yt-light">14 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Audio Equipment</td><td className="p-3 text-emergency-red">1-4%</td><td className="p-3 text-white">Sweetwater</td><td className="p-3 text-profit-green">5-7%</td><td className="p-3 text-yt-light">30 days</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-yt-light bg-yt-gray/50 p-4 rounded-lg border border-white/10">
            <strong className="text-profit-green">The takeaway:</strong> Never use Amazon as your primary link for electronics. The 1% rate is insulting. B&H and Adorama should be your defaults for cameras and laptops.
          </p>

          <h3 className="text-xl font-semibold tracking-wide text-white mt-8 mb-4">Software & Digital Tools</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-yt-gray/70">
                <tr>
                  <th className="text-left p-3 text-yt-light font-medium">What You&apos;re Linking</th>
                  <th className="text-left p-3 text-emergency-red font-medium">Amazon Pays</th>
                  <th className="text-left p-3 text-white font-medium">Better Option</th>
                  <th className="text-left p-3 text-profit-green font-medium">They Pay</th>
                  <th className="text-left p-3 text-yt-light font-medium">Cookie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">VPN Services</td><td className="p-3 text-yt-light/50">N/A</td><td className="p-3 text-white">Direct programs</td><td className="p-3 text-profit-green">30-100% first month</td><td className="p-3 text-yt-light">30-90 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">AI Tools</td><td className="p-3 text-emergency-red">1% (if physical)</td><td className="p-3 text-white">PartnerStack</td><td className="p-3 text-profit-green">20-30% recurring</td><td className="p-3 text-yt-light">90 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Editing Software</td><td className="p-3 text-yt-light/50">N/A</td><td className="p-3 text-white">Direct programs</td><td className="p-3 text-profit-green">20-40%</td><td className="p-3 text-yt-light">30-60 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Web Hosting</td><td className="p-3 text-yt-light/50">N/A</td><td className="p-3 text-white">ShareASale/Impact</td><td className="p-3 text-profit-green">$50-150 per signup</td><td className="p-3 text-yt-light">60-90 days</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-yt-light bg-yt-gray/50 p-4 rounded-lg border border-white/10">
            <strong className="text-profit-green">The takeaway:</strong> Software is where the real money is. A single VPN signup can pay more than 100 Amazon product sales. If you&apos;re recommending any digital tools, go direct or through PartnerStack.
          </p>

          <h3 className="text-xl font-semibold tracking-wide text-white mt-8 mb-4">Beauty & Personal Care</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-yt-gray/70">
                <tr>
                  <th className="text-left p-3 text-yt-light font-medium">What You&apos;re Linking</th>
                  <th className="text-left p-3 text-emergency-red font-medium">Amazon Pays</th>
                  <th className="text-left p-3 text-white font-medium">Better Option</th>
                  <th className="text-left p-3 text-profit-green font-medium">They Pay</th>
                  <th className="text-left p-3 text-yt-light font-medium">Cookie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Skincare</td><td className="p-3 text-emergency-red">3-10%</td><td className="p-3 text-white">Sephora (Rakuten)</td><td className="p-3 text-profit-green">5-12%</td><td className="p-3 text-yt-light">30 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Makeup</td><td className="p-3 text-emergency-red">3-10%</td><td className="p-3 text-white">Ulta (Impact)</td><td className="p-3 text-profit-green">5-10%</td><td className="p-3 text-yt-light">14 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Haircare & Tools</td><td className="p-3 text-emergency-red">3-10%</td><td className="p-3 text-white">Dermstore</td><td className="p-3 text-profit-green">8-15%</td><td className="p-3 text-yt-light">30 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Fragrances</td><td className="p-3 text-emergency-red">3-10%</td><td className="p-3 text-white">FragranceNet</td><td className="p-3 text-profit-green">10-15%</td><td className="p-3 text-yt-light">45 days</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-yt-light bg-yt-gray/50 p-4 rounded-lg border border-white/10">
            <strong className="text-profit-green">The takeaway:</strong> Amazon&apos;s beauty rates aren&apos;t terrible, but the cookie window kills you. Sephora and Ulta give you weeks instead of hours.
          </p>

          <h3 className="text-xl font-semibold tracking-wide text-white mt-8 mb-4">Home & DIY</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-yt-gray/70">
                <tr>
                  <th className="text-left p-3 text-yt-light font-medium">What You&apos;re Linking</th>
                  <th className="text-left p-3 text-emergency-red font-medium">Amazon Pays</th>
                  <th className="text-left p-3 text-white font-medium">Better Option</th>
                  <th className="text-left p-3 text-profit-green font-medium">They Pay</th>
                  <th className="text-left p-3 text-yt-light font-medium">Cookie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Power Tools</td><td className="p-3 text-emergency-red">3%</td><td className="p-3 text-white">Home Depot (Impact)</td><td className="p-3 text-profit-green">3-8%</td><td className="p-3 text-yt-light">14 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Hand Tools</td><td className="p-3 text-emergency-red">3%</td><td className="p-3 text-white">Lowe&apos;s (CJ)</td><td className="p-3 text-profit-green">4-8%</td><td className="p-3 text-yt-light">7 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Furniture</td><td className="p-3 text-emergency-red">3%</td><td className="p-3 text-white">Wayfair (CJ)</td><td className="p-3 text-profit-green">5-7%</td><td className="p-3 text-yt-light">7 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Smart Home</td><td className="p-3 text-emergency-red">1-3%</td><td className="p-3 text-white">Best Buy (Rakuten)</td><td className="p-3 text-profit-green">2-5%</td><td className="p-3 text-yt-light">7 days</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-yt-light bg-yt-gray/50 p-4 rounded-lg border border-white/10">
            <strong className="text-profit-green">The takeaway:</strong> Home Depot and Lowe&apos;s let you link to entire project lists. Instead of 3% on a drill, get 3-8% on all the materials for a deck build. Same video, way more revenue.
          </p>

          <h3 className="text-xl font-semibold tracking-wide text-white mt-8 mb-4">Fashion & Apparel</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-yt-gray/70">
                <tr>
                  <th className="text-left p-3 text-yt-light font-medium">What You&apos;re Linking</th>
                  <th className="text-left p-3 text-emergency-red font-medium">Amazon Pays</th>
                  <th className="text-left p-3 text-white font-medium">Better Option</th>
                  <th className="text-left p-3 text-profit-green font-medium">They Pay</th>
                  <th className="text-left p-3 text-yt-light font-medium">Cookie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Clothing</td><td className="p-3 text-emergency-red">4%</td><td className="p-3 text-white">Nordstrom (Rakuten)</td><td className="p-3 text-profit-green">5-10%</td><td className="p-3 text-yt-light">14 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Shoes</td><td className="p-3 text-emergency-red">4%</td><td className="p-3 text-white">Zappos/DSW</td><td className="p-3 text-profit-green">7-10%</td><td className="p-3 text-yt-light">14 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Athletic Wear</td><td className="p-3 text-emergency-red">4%</td><td className="p-3 text-white">Nike/UA (Awin)</td><td className="p-3 text-profit-green">7-11%</td><td className="p-3 text-yt-light">30 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Watches</td><td className="p-3 text-emergency-red">4%</td><td className="p-3 text-white">Jomashop</td><td className="p-3 text-profit-green">5-8%</td><td className="p-3 text-yt-light">30 days</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-yt-light bg-yt-gray/50 p-4 rounded-lg border border-white/10">
            <strong className="text-profit-green">The takeaway:</strong> Fashion is competitive. Lots of options, similar rates. The real win is cookie windows&mdash;Nike&apos;s 30-day cookie beats Amazon&apos;s 24 hours every time for considered purchases.
          </p>

          <h3 className="text-xl font-semibold tracking-wide text-white mt-8 mb-4">Health & Supplements</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-yt-gray/70">
                <tr>
                  <th className="text-left p-3 text-yt-light font-medium">What You&apos;re Linking</th>
                  <th className="text-left p-3 text-emergency-red font-medium">Amazon Pays</th>
                  <th className="text-left p-3 text-white font-medium">Better Option</th>
                  <th className="text-left p-3 text-profit-green font-medium">They Pay</th>
                  <th className="text-left p-3 text-yt-light font-medium">Cookie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Vitamins</td><td className="p-3 text-emergency-red">1-4.5%</td><td className="p-3 text-white">iHerb</td><td className="p-3 text-profit-green">5-10%</td><td className="p-3 text-yt-light">30 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Protein & Fitness</td><td className="p-3 text-emergency-red">1-4.5%</td><td className="p-3 text-white">Bodybuilding.com</td><td className="p-3 text-profit-green">8-15%</td><td className="p-3 text-yt-light">7 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Wellness Subscriptions</td><td className="p-3 text-yt-light/50">N/A</td><td className="p-3 text-white">Direct (AG1, etc.)</td><td className="p-3 text-profit-green">$50-100 bounty</td><td className="p-3 text-yt-light">30 days</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-yt-light bg-yt-gray/50 p-4 rounded-lg border border-white/10">
            <strong className="text-profit-green">The takeaway:</strong> Stop linking to $30 supplement bottles. Wellness subscriptions with bounty payouts ($50-100 per signup) are where the money is.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">THE COOKIE WINDOW CHEAT SHEET</h2>
          <p className="text-yt-light">
            Here&apos;s the rule: <strong className="text-white">The more expensive the product, the longer cookie you need.</strong>
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-yt-gray/70">
                <tr>
                  <th className="text-left p-3 text-yt-light font-medium">Purchase Type</th>
                  <th className="text-left p-3 text-yt-light font-medium">Typical Decision Time</th>
                  <th className="text-left p-3 text-profit-green font-medium">Minimum Cookie You Need</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Impulse (&lt;$50)</td><td className="p-3 text-yt-light">Minutes</td><td className="p-3 text-profit-green">24 hours (Amazon is fine)</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">Considered ($50-$500)</td><td className="p-3 text-yt-light">Days</td><td className="p-3 text-profit-green">7-14 days</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-yt-light">High-ticket ($500+)</td><td className="p-3 text-yt-light">Weeks</td><td className="p-3 text-profit-green">30 days</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-yt-light">
            If you&apos;re linking to a $1,500 laptop through Amazon, you&apos;re betting someone will buy within 24 hours of clicking. They won&apos;t. Use B&H or Adorama with their 30-day windows.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">QUICK REFERENCE: WHICH NETWORK FOR WHAT</h2>
          <p className="text-yt-light">Don&apos;t want to remember all the merchants? Here&apos;s the shortcut by network:</p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-yt-gray/70">
                <tr>
                  <th className="text-left p-3 text-white font-medium">Network</th>
                  <th className="text-left p-3 text-yt-light font-medium">What They&apos;re Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="bg-yt-gray/30"><td className="p-3 text-white font-medium">Amazon</td><td className="p-3 text-yt-light">Low-cost impulse buys, convenience</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-white font-medium">Impact</td><td className="p-3 text-yt-light">Home Depot, Walmart, Target, software</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-white font-medium">CJ Affiliate</td><td className="p-3 text-yt-light">Lowe&apos;s, GoPro, Wayfair, Office Depot</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-white font-medium">Rakuten</td><td className="p-3 text-yt-light">Best Buy, Sephora, GameStop, Macy&apos;s</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-white font-medium">ShareASale</td><td className="p-3 text-yt-light">Etsy, WP Engine, Bluehost, Warby Parker</td></tr>
                <tr className="bg-yt-gray/30"><td className="p-3 text-white font-medium">Awin</td><td className="p-3 text-yt-light">Nike, HP, Under Armour, ASOS</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-yt-light bg-yt-gray/50 p-4 rounded-lg border border-white/10">
            <strong className="text-profit-green">Pro tip:</strong> Start with Amazon + Impact. Impact alone gives you access to hundreds of brands with one signup.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">THE HIDDEN COST OF &quot;SET AND FORGET&quot;</h2>
          <p className="text-yt-light">Here&apos;s what nobody talks about: links break.</p>
          <ul className="text-yt-light space-y-2 list-disc list-inside mb-6">
            <li>Products get discontinued</li>
            <li>URLs change</li>
            <li>Pages go 404</li>
            <li>Items go out of stock permanently</li>
          </ul>
          <p className="text-yt-light">
            That video you posted 18 months ago with 50,000 views? If those links are dead, you&apos;re losing money every single day.
          </p>
          <p className="text-yt-light">
            Most creators never check. They post and move on. Then they wonder why their affiliate revenue is flat even though their views are growing.
          </p>
          <p className="text-yt-light">
            <strong className="text-white">The fix:</strong> Audit your links monthly. Or use a tool like <Link href="/" className="text-profit-green hover:underline">LinkMedic</Link> to scan your entire channel automatically. It catches broken links across Amazon, Impact, CJ, Rakuten, and more.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">PUTTING IT ALL TOGETHER</h2>
          <p className="text-yt-light">Here&apos;s your action plan:</p>
          <ol className="text-yt-light space-y-2 list-decimal list-inside mb-6">
            <li><strong className="text-white">Pick your niche from the map above</strong></li>
            <li><strong className="text-white">Sign up for the recommended alternative</strong> (start with one)</li>
            <li><strong className="text-white">Update your top 10 performing videos</strong> with better-paying links</li>
            <li><strong className="text-white">Check old videos monthly</strong> for broken links</li>
            <li><strong className="text-white">Repeat</strong></li>
          </ol>
          <p className="text-yt-light">
            You don&apos;t need to change everything overnight. Start with your highest-traffic videos. Swap Amazon links for better alternatives. Watch your revenue climb.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-yt-gray/70 backdrop-blur-sm border border-profit-green/30 rounded-xl text-center">
          <h3 className="font-display text-2xl text-white mb-4">FIND YOUR BROKEN LINKS</h3>
          <p className="text-yt-light mb-6">
            Tired of manually checking every link in every video? LinkMedic scans your YouTube channel for broken affiliate links and out-of-stock products. Works with Amazon, B&H, Impact, CJ, Rakuten, ShareASale, and Awin.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-profit-green text-black font-bold rounded-lg hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            Run Free Audit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-yt-dark">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </div>
          <p className="text-yt-light/50 text-sm mb-4">
            Detect broken links. Suggest fixes. Scan weekly.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-yt-light">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
            <Link href="/intel" className="hover:text-white transition">Intel Blog</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
