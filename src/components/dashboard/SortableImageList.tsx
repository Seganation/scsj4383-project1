"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, XIcon } from "lucide-react";
import { Image } from "@/components";
import React from "react";

function DraggableImage({
  image,
  index,
  handleDelete,
  listeners,
  attributes,
  isDragging,
  transform,
  transition,
}: any) {
  return (
    <div
      className={`relative w-[100px] h-[100px] ${isDragging ? "opacity-50" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <Image
        height={100}
        width={100}
        src={image}
        alt="Product Image"
        className="w-full h-full object-cover rounded-lg border"
      />
      <button
        onClick={() => handleDelete(index)}
        type="button"
        className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-lg text-white"
      >
        <XIcon className="w-3 h-3" />
      </button>
      <span className="absolute bottom-1 left-1 bg-white/80 rounded p-1 text-xs font-bold">
        {index + 1}
      </span>
      <span className="absolute top-1 left-1 cursor-grab text-gray-500">
        <GripVertical size={16} />
      </span>
    </div>
  );
}

function SortableImage({ image, index, handleDelete, id }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ touchAction: "none" }}>
      <DraggableImage
        image={image}
        index={index}
        handleDelete={handleDelete}
        listeners={listeners}
        attributes={attributes}
        isDragging={isDragging}
        transform={transform}
        transition={transition}
      />
    </div>
  );
}

export function SortableImageList({
  images,
  onReorder,
  handleDelete,
}: {
  images: string[];
  onReorder: (newOrder: string[]) => void;
  handleDelete: (index: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (active.id !== over?.id) {
          const oldIndex = images.findIndex((img) => img === active.id);
          const newIndex = images.findIndex((img) => img === over?.id);
          onReorder(arrayMove(images, oldIndex, newIndex));
        }
      }}
    >
      <SortableContext items={images} strategy={verticalListSortingStrategy}>
        <div className="flex gap-5 mt-2">
          {images.map((image, index) => (
            <SortableImage
              key={image}
              id={image}
              image={image}
              index={index}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
