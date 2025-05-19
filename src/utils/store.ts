import { CanvasType } from "@/app/components/CanvasComponent";
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "@/config/pdfDocument";
import { create } from "zustand";

type CanvasStore = {
  canvasZoom: number;
  increaseCanvasZoom: () => void;
  decreaseCanvasZoom: () => void;

  canvasSelected: CanvasType | undefined;
  setCanvasSelected: (canvas: CanvasType | undefined) => void;

  nextBlankID: number;
  incrementBlankID: () => void;

  objectIsSelected: boolean;
  setObjectIsSelected: (value: boolean) => void;

  validCanvasIDs: number[];
  incrementValidCanvasIDs: () => void;
  invalidateCanvasID: (invalidatedID: number) => void;

  fabricCanvases: fabric.Canvas[];
  addFabricCanvas: (canvas: fabric.Canvas) => void;
  removeCanvasByIndex: (index: number) => void;

  showRemovePage: boolean;
  setShowRemovePage: (value: boolean) => void;

  showNoSelection: boolean;
  setShowNoSelection: (value: boolean) => void;
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  canvasZoom: 0.8,
  increaseCanvasZoom: () => {
    const newZoom = Math.min(get().canvasZoom + ZOOM_STEP, MAX_ZOOM);
    set({ canvasZoom: newZoom });
  },
  decreaseCanvasZoom: () => {
    const newZoom = Math.max(get().canvasZoom - ZOOM_STEP, MIN_ZOOM);
    set({ canvasZoom: newZoom });
  },

  canvasSelected: undefined,
  setCanvasSelected: (canvas) => {
    set(() => ({
      canvasSelected: canvas,
    }));
  },

  nextBlankID: 1,
  incrementBlankID: () => {
    set((state) => ({ nextBlankID: state.nextBlankID + 1 }));
  },

  objectIsSelected: false,
  setObjectIsSelected: (value) => {
    set(() => ({ objectIsSelected: value }));
  },

  validCanvasIDs: [0],
  incrementValidCanvasIDs: () => {
    const { validCanvasIDs, nextBlankID, incrementBlankID } = get();

    incrementBlankID();

    set({ validCanvasIDs: [...validCanvasIDs, nextBlankID] });
  },
  invalidateCanvasID: (invalidateID: number) => {
    set((state) => ({
      validCanvasIDs: state.validCanvasIDs.filter((i) => i !== invalidateID),
    }));
  },

  fabricCanvases: [],
  addFabricCanvas: (canvas: fabric.Canvas) => {
    set((state) => ({ fabricCanvases: [...state.fabricCanvases, canvas] }));
  },
  removeCanvasByIndex: (index: number) => {
    set((state) => ({
      fabricCanvases: state.fabricCanvases.filter((_, i) => i !== index),
    }));
  },

  showRemovePage: false,
  setShowRemovePage: (value: boolean) => {
    set(() => ({ showRemovePage: value }));
  },

  showNoSelection: false,
  setShowNoSelection: (value: boolean) => {
    set(() => ({ showNoSelection: value }));
  },
}));
