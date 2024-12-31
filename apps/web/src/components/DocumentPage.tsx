"use client"
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Share2 } from 'lucide-react';
import CollaborativeEditor from '@/components/CollabEditor';
import MyAlert from './MyAlert';
import { ShareModal } from './Interface';

export interface CollaborativeEditorProps {
    documentId: string;
    initialContent: any;
    onSave: (content: any) => void;
}


const DocumentPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch document');
      return response.json();
    }
  });

  const { mutate: saveDocument } = useMutation({
    mutationFn: async ({ content }: any) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to save document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['document', id] as any);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{document.title}</h1>
          <p className="text-sm text-gray-500">
            Owned by {document.owner.username}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <div className="flex -space-x-2">
            {document.collaborators.map((collaborator : any) => (
              <div
                key={collaborator.id}
                className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                title={collaborator.user.username}
              >
                {collaborator.user.username[0].toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <CollaborativeEditor
          documentId={id as string}
          initialContent={document.content}
          onSave={saveDocument}
        />
      </main>

      {showShareModal && (
        <ShareModal
          documentId={id}
          onClose={() => setShowShareModal(false)}
          currentCollaborators={document.collaborators}
        />
      )}
    </div>
  );
};

export default DocumentPage;