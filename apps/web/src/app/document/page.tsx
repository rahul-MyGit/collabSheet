"use client"
import CollabEditor from '@/components/CollabEditor'
import DocumentList from '@/components/DocumentList'
import DocumentPage from '@/components/DocumentPage'
import React from 'react'

//TODO: EditorPage
const page = () => {
  return (
    <>
    <div>DOCUMENT PAGE</div>
    <div className="flex flex-col h-screen">
      {/* <DocumentList />
      <DocumentPage /> */}
    </div>
    <CollabEditor documentId='doc1' initialContent={""} onSave={(content) => {console.log('Saving content', content); }}/>
    </>
  )
}

export default page