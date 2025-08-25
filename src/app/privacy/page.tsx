export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account, upload files, or contact us for support.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Account Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Email address</li>
            <li>Name and profile information</li>
            <li>Authentication credentials</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-3">File Content</h3>
          <p className="mb-4">
            Files you upload to our service are stored securely and are only accessible to you and those you explicitly share them with.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Provide and maintain our services</li>
            <li>Process your transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our services</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information and files against unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="mb-4">
            We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and data at any time.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at privacy@yourdomain.com.
          </p>
        </div>
      </div>
    </div>
  );
}
