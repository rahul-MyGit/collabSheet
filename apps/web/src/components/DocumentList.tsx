"use client"
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { File, Plus, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import MyAlert from './MyAlert';

const DocumentList = () => {
  const queryClient = useQueryClient();
  const [newDocTitle, setNewDocTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await fetch('/api/v1/sheet', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    }
  });

  const { mutate: createDocument } = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch('/api/v1/sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'] as any );
      setShowCreateModal(false);
      setNewDocTitle('');
    }
  });

  const { mutate: deleteDocument } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/sheet/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete document');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'] as any);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <MyAlert />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Documents</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          New Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc: any) => (
          <div
            key={doc.id}
            className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <Link href={`/document/${doc.id}`} className="flex-1">
                <h2 className="text-lg font-medium hover:text-blue-500">
                  {doc.title}
                </h2>
              </Link>
              {doc.ownerId === doc.owner.id && (
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                Updated {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {doc.collaborators.length}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create New Document</h2>
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Document Title"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => createDocument(newDocTitle)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!newDocTitle.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;