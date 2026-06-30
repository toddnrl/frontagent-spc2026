"use client";

import type { User } from "@supabase/supabase-js";
import { AiCosDetailPanel } from "../AiCosDetailPanel";
import { AiCosKnowledgeSidebar } from "../AiCosKnowledgeSidebar";
import { KnowledgePeekPane } from "./KnowledgePeekPane";
import { KnowledgeSection } from "./KnowledgeSection";
import { UNFILED_FOLDER_ID, useKnowledgeWorkspace } from "./useKnowledgeWorkspace";

export function KnowledgeWorkspace({ organizationId, user }: { organizationId: string; user?: User | null }) {
  const workspace = useKnowledgeWorkspace(organizationId);

  return (
    <>
      <AiCosKnowledgeSidebar
        sources={workspace.knowledge}
        folders={workspace.knowledgeFolders}
        unfiledFolderId={UNFILED_FOLDER_ID}
        selectedFolder={workspace.selectedFolder}
        onSelectFolder={workspace.setSelectedFolder}
        onCreateFolder={workspace.handleCreateFolder}
        onRenameFolder={workspace.handleRenameFolder}
        onDeleteFolder={workspace.handleDeleteFolder}
        isLoading={workspace.isKnowledgeLoading}
        error={workspace.knowledgeError}
        search={workspace.knowledgeSearch}
        onSearchChange={workspace.setKnowledgeSearch}
      />

      <div className="min-h-0 overflow-y-auto rounded-[20px] bg-white p-8">
        <KnowledgeSection
          sources={workspace.knowledge}
          selectedSourceId={workspace.selectedKnowledgeId}
          selectedFolder={workspace.selectedFolder}
          search={workspace.knowledgeSearch}
          chunks={workspace.knowledgeChunks}
          isChunksLoading={workspace.isKnowledgeChunksLoading}
          isMutating={workspace.isKnowledgeMutating}
          error={workspace.knowledgeError}
          onSelectSource={workspace.setSelectedKnowledgeId}
          onPeekSource={workspace.setPeekSource}
          onCreate={workspace.handleCreateKnowledge}
          onUpload={workspace.handleUploadKnowledge}
          onUpdate={workspace.handleUpdateKnowledge}
          onDelete={workspace.handleDeleteKnowledge}
        />
      </div>

      <AiCosDetailPanel activeSection="knowledge" organizationId={organizationId} user={user} />

      {workspace.peekSource && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => workspace.setPeekSource(null)} />
          <KnowledgePeekPane
            key={workspace.peekSource.id}
            source={workspace.peekSource}
            chunks={workspace.knowledgeChunks}
            isLoading={workspace.isKnowledgeChunksLoading}
            onClose={() => workspace.setPeekSource(null)}
            onUpdateChunk={workspace.handleUpdateChunk}
            onDeleteChunk={workspace.handleDeleteChunk}
            onUpdateContent={workspace.handleUpdateKnowledgeContent}
          />
        </>
      )}
    </>
  );
}
