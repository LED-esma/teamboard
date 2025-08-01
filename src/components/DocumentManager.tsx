import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, FileText, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmbeddedComments from './EmbeddedComments';
import { firebaseDocuments, FirebaseDocument } from '../services/firebase';

interface Document extends FirebaseDocument {
  // Extend FirebaseDocument to include any additional local properties
}

interface AddDocumentData {
  title: string;
  url: string;
  type: 'google-drive' | 'google-sheets' | 'external' | 'uploaded';
  author: string;
  authorId: string;
  description?: string;
}

const DocumentManager: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    url: '',
    type: 'external' as Document['type'],
    description: ''
  });
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load documents from Firebase
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const docs = await firebaseDocuments.getAll();
        setDocuments(docs as Document[]);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleAddDocument = async () => {
    if (!newDocument.title || !newDocument.url || !user) return;

    try {
      const documentData: AddDocumentData = {
        title: newDocument.title,
        url: newDocument.url,
        type: newDocument.type,
        author: user.username,
        authorId: user.id,
        description: newDocument.description
      };

      const docId = await firebaseDocuments.add(documentData);

      if (docId) {
        // Document added successfully, it will be loaded by the real-time listener
        setNewDocument({ title: '', url: '', type: 'external', description: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await firebaseDocuments.delete(id);
      // Document will be removed by the real-time listener
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'google-drive':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'google-sheets':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'google-drive':
        return 'Google Drive';
      case 'google-sheets':
        return 'Google Sheets';
      case 'external':
        return 'External Link';
      case 'uploaded':
        return 'Uploaded File';
      default:
        return 'Document';
    }
  };

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Documents</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Document</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={newDocument.title}
                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter document title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL
              </label>
              <input
                type="url"
                value={newDocument.url}
                onChange={(e) => setNewDocument({ ...newDocument, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={newDocument.type}
                onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value as Document['type'] })}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="external">External Link</option>
                <option value="google-drive">Google Drive</option>
                <option value="google-sheets">Google Sheets</option>
                <option value="uploaded">Uploaded File</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newDocument.description}
                onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Add a description..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Document
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No documents added yet.</p>
            <p className="text-sm">Click "Add Document" to get started.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {getDocumentIcon(doc.type)}
                  <div>
                    <h3 className="text-sm font-medium text-white">{doc.title}</h3>
                    <p className="text-sm text-gray-400">
                      {getTypeLabel(doc.type)} • Added by {doc.author} • {formatDate(doc.dateAdded)}
                    </p>
                    {doc.description && (
                      <p className="text-sm text-gray-300 mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedDocument(selectedDocument?.id === doc.id ? null : doc)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-400 hover:text-primary-400"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Comments</span>
                  </button>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Embedded Comments */}
              {selectedDocument?.id === doc.id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <EmbeddedComments
                    contextId={doc.id}
                    contextType="document"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentManager; 