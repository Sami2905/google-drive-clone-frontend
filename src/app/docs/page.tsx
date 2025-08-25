export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Documentation</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-6">
            Welcome to the Google Drive Clone documentation. This guide will help you understand how to use the platform effectively.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4">
            The Google Drive Clone provides secure file storage and sharing capabilities with a familiar interface.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Secure file upload and storage</li>
            <li>Folder organization</li>
            <li>File sharing and permissions</li>
            <li>Real-time collaboration</li>
            <li>Mobile-responsive design</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Support</h2>
          <p className="mb-4">
            For additional support, please contact our team or check our knowledge base.
          </p>
        </div>
      </div>
    </div>
  );
}
