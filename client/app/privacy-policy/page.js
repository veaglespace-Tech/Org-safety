import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | ढोल - ताशा महासंघ",
  description: "Privacy Policy for the ढोल - ताशा महासंघ website and mobile application.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 dark:bg-slate-950">
      <div className="site-container max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ChevronLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-slate-900 md:p-12">
          <h1 className="mb-6 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">1. Introduction</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Welcome to the <strong>ढोल - ताशा महासंघ</strong> (Dhol - Tasha Mahasangh). We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our mobile application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">2. Information We Collect</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We may collect information about you in a variety of ways. The information we may collect includes:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, phone number, and organization details that you voluntarily give to us when you register with us.
                </li>
                <li>
                  <strong>Derivative Data:</strong> Information our servers automatically collect when you access the platform, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the platform.
                </li>
                <li>
                  <strong>Mobile Application Information:</strong> If you connect using our mobile application, we may request access or permission to certain features from your mobile device, including your device's camera, storage, and other sensors.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">3. How We Use Your Information</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the website or mobile application to:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
                <li>Create and manage your account.</li>
                <li>Facilitate communication between organizations and members.</li>
                <li>Improve our platform and user experience.</li>
                <li>Send you important updates, notifications, and administrative information.</li>
                <li>Monitor and analyze usage and trends to improve your experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">4. Security of Your Information</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">5. Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                If you have questions or comments about this Privacy Policy, please contact us at our official contact email or through the platform support.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
