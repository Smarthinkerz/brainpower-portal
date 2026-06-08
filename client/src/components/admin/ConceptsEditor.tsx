import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, Eye, GripVertical, Clock, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DEFAULT_CONCEPTS = [
  { key: "concept_systemic_thinking", title: "Systemic Thinking", description: "Understanding interconnected systems and their emergent properties" },
  { key: "concept_cognitive_biases", title: "Cognitive Biases", description: "Recognizing and mitigating mental shortcuts that lead to errors" },
  { key: "concept_decision_intelligence", title: "Decision Intelligence", description: "Data-driven frameworks for better decision-making" },
  { key: "concept_mental_models", title: "Mental Models", description: "Frameworks for understanding how the world works" },
];

interface ConceptFormData {
  blockKey: string;
  title: string;
  content: string;
  learnMoreContent: string;
  mediaUrl: string;
}

export function ConceptsEditor() {
  const { data: concepts, isLoading, refetch } = trpc.admin.content.list.useQuery({ status: "published" });
  const upsertConcept = trpc.admin.content.upsert.useMutation();
  const deleteConcept = trpc.admin.content.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<ConceptFormData | null>(null);

  const conceptBlocks = concepts?.filter(c => c.blockType === "concept") || [];
  const [orderedConcepts, setOrderedConcepts] = useState(conceptBlocks);

  // Update ordered concepts when data changes
  useState(() => {
    if (conceptBlocks.length > 0 && orderedConcepts.length !== conceptBlocks.length) {
      setOrderedConcepts(conceptBlocks);
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedConcepts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      toast.success("Concept order updated");
    }
  };

  const handleSave = async (data: ConceptFormData) => {
    try {
      await upsertConcept.mutateAsync({
        blockKey: data.blockKey,
        blockType: "concept",
        title: data.title,
        content: data.content,
        mediaUrl: data.mediaUrl,
        metadata: {
          learnMoreContent: data.learnMoreContent,
        },
        status: "published",
      });

      toast.success("Concept saved successfully!");
      setIsDialogOpen(false);
      setEditingConcept(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save concept");
    }
  };

  const handleDelete = async (blockId: number) => {
    if (!confirm("Are you sure you want to delete this concept?")) return;

    try {
      await deleteConcept.mutateAsync({ blockId });
      toast.success("Concept deleted");
      refetch();
    } catch (error: any) {
      toast.error("Failed to delete concept");
    }
  };

  const openEditDialog = (concept: any) => {
    const metadata = (concept.metadata as any) || {};
    setEditingConcept({
      blockKey: concept.blockKey,
      title: concept.title || "",
      content: concept.content || "",
      learnMoreContent: metadata.learnMoreContent || "",
      mediaUrl: concept.mediaUrl || "",
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingConcept({
      blockKey: `concept_${Date.now()}`,
      title: "",
      content: "",
      learnMoreContent: "",
      mediaUrl: "",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-white">Loading concepts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Concepts Section</h2>
          <p className="text-gray-400">Manage concept cards displayed on your website. Drag cards to reorder.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Concept
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingConcept?.blockKey.startsWith("concept_") && conceptBlocks.find(c => c.blockKey === editingConcept.blockKey) ? "Edit" : "Add"} Concept
              </DialogTitle>
            </DialogHeader>
            {editingConcept && (
              <ConceptForm
                data={editingConcept}
                onSave={handleSave}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingConcept(null);
                }}
                isSaving={upsertConcept.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Concepts Grid with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedConcepts.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orderedConcepts.map((concept) => (
          <SortableConceptCard
            key={concept.id}
            concept={concept}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        ))}

        {orderedConcepts.length === 0 && (
          <Card className="bg-gray-900/50 border-gray-800 col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">No concepts yet. Add your first concept to get started.</p>
              <Button onClick={openNewDialog} className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add First Concept
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </SortableContext>
  </DndContext>
    </div>
  );
}

function SortableConceptCard({
  concept,
  onEdit,
  onDelete,
}: {
  concept: any;
  onEdit: (concept: any) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: concept.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const metadata = (concept.metadata as any) || {};

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <button
              className="mt-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <div className="flex-1">
            <CardTitle className="text-white">{concept.title}</CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              {concept.content}
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(concept)}
            className="text-[#00d4ff] hover:text-[#00b8e6]"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(concept.id)}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    {(concept.mediaUrl || metadata.learnMoreContent) && (
      <CardContent>
        {concept.mediaUrl && (
          <div className="mb-2">
            <img src={concept.mediaUrl} alt={concept.title || ""} className="w-full h-32 object-cover rounded" />
          </div>
        )}
        {metadata.learnMoreContent && (
          <p className="text-sm text-gray-500">Has "Learn More" content</p>
        )}
      </CardContent>
    )}
  </Card>
  );
}

function ConceptForm({
  data,
  onSave,
  onCancel,
  isSaving,
}: {
  data: ConceptFormData;
  onSave: (data: ConceptFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState(data);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="concept-title" className="text-white">Title</Label>
        <Input
          id="concept-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Systemic Thinking"
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="concept-description" className="text-white">Short Description</Label>
        <Textarea
          id="concept-description"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Brief description shown on the card"
          rows={3}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="concept-learn-more" className="text-white">"Learn More" Content</Label>
        <Textarea
          id="concept-learn-more"
          value={formData.learnMoreContent}
          onChange={(e) => setFormData({ ...formData, learnMoreContent: e.target.value })}
          placeholder="Detailed content shown when user clicks 'Learn More'"
          rows={6}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="concept-image" className="text-white">Image URL</Label>
        <Input
          id="concept-image"
          value={formData.mediaUrl}
          onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-gray-700"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSave(formData)}
          className="flex-1 bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
          disabled={isSaving || !formData.title}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Concept
        </Button>
      </div>
    </div>
  );
}
