import { CanvasType } from "@/app/ImgPDF";
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
  setObjectIsSelected: (value: boolean) => {
    set(() => ({ objectIsSelected: value }));
  },

  validCanvasIDs: [],
}));
