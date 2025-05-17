"use client";
import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { PAGE_HEIGHT, PAGE_WIDTH } from "../PDF_Settings";

type CanvasComponentProps = {
  id: number;
  setCanvasSelected: Function;
  setCanvasIDs: Function;
  classname: string;
  zoom: number;
  setActiveObj: Function;
};

export function CanvasComponent({
  id,
  setCanvasSelected,
  setCanvasIDs,
  classname,
  zoom,
  setActiveObj,
}: CanvasComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

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
        setActiveObj(() => true);
      });

      canvas.on("selection:cleared", () => {
        setActiveObj(() => false);
      });

      canvas.on("mouse:down", () => {
        setCanvasSelected((prev: { id: number; canvas: fabric.Canvas }) => {
          if (prev.canvas && prev.id !== id) {
            prev.canvas.discardActiveObject();
            prev.canvas.renderAll();
          }
          return { id: id, canvas: canvas };
        });
        setCanvasSelected({ id: id, canvas: canvas });
        canvas.renderAll();
      });
    }
  }, [id, setCanvasSelected, setCanvasIDs, setActiveObj]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;

      canvas.setZoom(zoom);
      canvas.setWidth(PAGE_WIDTH * canvas.getZoom());
      canvas.setHeight(PAGE_HEIGHT * canvas.getZoom());
      canvas.renderAll();
    }
  }, [zoom]);

  return <canvas ref={canvasRef} id={id.toString()} className={classname} />;
}
