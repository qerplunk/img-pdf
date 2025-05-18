"use client";
import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { PAGE_HEIGHT, PAGE_WIDTH } from "@/config/pdfDocument";
import { useCanvasStore } from "@/utils/store";

type CanvasComponentProps = {
  id: number;
  setCanvasIDs: Function;
  classname: string;
};

export function CanvasComponent({
  id,
  setCanvasIDs,
  classname,
}: CanvasComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const canvasZoom = useCanvasStore((state) => state.canvasZoom);
  const canvasSelected = useCanvasStore((state) => state.canvasSelected);
  const setCanvasSelected = useCanvasStore((state) => state.setCanvasSelected);
  const setObjectIsSelected = useCanvasStore(
    (state) => state.setObjectIsSelected,
  );

  useEffect(() => {
    if (!fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        backgroundColor: "white",
        preserveObjectStacking: true,
      });
      fabricCanvasRef.current = canvas;
      canvas.selection = false;

      setCanvasIDs((prev: fabric.Canvas[]) =>
        Array.isArray(prev) ? [...prev, canvas] : [canvas],
      );

      setCanvasSelected({ id: 0, canvas: canvas });

      canvas.on("selection:created", () => {
        setObjectIsSelected(true);
      });

      canvas.on("selection:cleared", () => {
        setObjectIsSelected(false);
      });

      canvas.on("mouse:down", () => {
        setCanvasSelected({ id, canvas });
        if (canvasSelected) {
          canvasSelected.canvas.discardActiveObject();
        }
        canvas.renderAll();
      });
    }
  }, [
    id,
    canvasSelected,
    setCanvasSelected,
    setCanvasIDs,
    setObjectIsSelected,
  ]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;

      canvas.setZoom(canvasZoom);
      canvas.setWidth(PAGE_WIDTH * canvas.getZoom());
      canvas.setHeight(PAGE_HEIGHT * canvas.getZoom());
      canvas.renderAll();
    }
  }, [canvasZoom]);

  return <canvas ref={canvasRef} id={id.toString()} className={classname} />;
}
