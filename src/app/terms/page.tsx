export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using our Google Drive Clone service, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Use of Service</h2>
          <p className="mb-4">
            Our service provides cloud storage and file sharing capabilities. You may use the service for lawful purposes only and in accordance with these Terms.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Prohibited Uses</h3>
          <p className="mb-4">You agree not to use the service to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Upload or share illegal content</li>
            <li>Violate intellectual property rights</li>
            <li>Transmit malware or harmful code</li>
            <li>Attempt to gain unauthorized access</li>
            <li>Interfere with service operation</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">File Storage and Sharing</h2>
          <p className="mb-4">
            You retain ownership of files you upload. You are responsible for ensuring you have the right to share any content you upload or distribute.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
          <p className="mb-4">
            We strive to maintain high service availability but cannot guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect service availability.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            Our liability is limited to the amount you paid for the service in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="mb-4">
            We may update these terms from time to time. We will notify you of any material changes via email or through the service.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            If you have questions about these Terms of Service, please contact us at legal@yourdomain.com.
          </p>
        </div>
      </div>
    </div>
  );
}
