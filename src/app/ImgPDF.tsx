"use client";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import Link from "next/link";
import { AlertScreen, AlertTimeout } from "./components/Alerts";
import { SideMenu } from "./components/SideMenu";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./PDF_Settings";

const CanvasComponent = ({
  id,
  setCanvasSelected,
  setCanvasIDs,
  classname,
  zoom,
  setActiveObj,
}: {
  id: number;
  setCanvasSelected: Function;
  setCanvasIDs: Function;
  classname: string;
  zoom: number;
  setActiveObj: Function;
}) => {
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
};

export function ImgPDF() {
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = "#FF0000";
  fabric.Object.prototype.cornerStyle = "rect";
  fabric.Object.prototype.cornerStrokeColor = "#FFFFFF";
  fabric.Object.prototype.cornerSize = 12;
  fabric.Object.prototype.borderColor = "#FF0000";
  fabric.Object.prototype.borderScaleFactor = 2;
  fabric.Object.prototype.hasRotatingPoint = true;
  fabric.Object.prototype.rotatingPointOffset = 0.1;

  const [canvasZoom, setCanvasZoom] = useState<number>(0.8);

  // Store fabric canvases, used to add images and export
  const [fabricCanvases, setC] = useState<fabric.Canvas[]>();

  // Store unique canvas IDs, used for rendering correct canvas
  const [canvasIDs, setCanvasIDs] = useState<number[]>([0]);

  const [nextBlankID, setNextBlankID] = useState<number>(1);

  const [canvasSelected, setCanvasSelected] = useState<{
    id: number;
    canvas: fabric.Canvas;
  }>();

  const [activeObj, setActiveObj] = useState<boolean>(false);

  const [showAlert_RemoveConfirmation, setShowAlert_RemoveConfirmation] =
    useState<boolean>(false);
  const [showAlert_NoSelected, setShowAlert_NoSelected] =
    useState<boolean>(false);

  return (
    <div className="flex min-h-screen w-full bg-stone-900 pb-28">
      <SideMenu
        canvasSelected={canvasSelected}
        canvases={canvasIDs}
        setShowAlert_RemoveConfirmation={setShowAlert_RemoveConfirmation}
        setShowAlert_NoSelected={setShowAlert_NoSelected}
        setCanvases={setCanvasIDs}
        nextBlankID={nextBlankID}
        setNextBlankID={setNextBlankID}
        fabricCanvases={fabricCanvases}
        canvasZoom={canvasZoom}
        setCanvasZoom={setCanvasZoom}
        activeObj={activeObj}
      />

      <div className="flex w-full justify-center pt-10">
        <div id="Canvases" className="flex flex-col">
          {canvasIDs.map((value, _) => (
            <div key={value} className="flex items-center pb-4">
              <p
                className={`select-none whitespace-nowrap pr-2 text-xl text-red-600 ${canvasSelected?.id === value ? "" : "invisible"}`}
              >
                {"-->"}
              </p>
              <CanvasComponent
                id={value}
                setCanvasSelected={setCanvasSelected}
                setCanvasIDs={setC}
                classname={
                  canvasSelected?.id === value
                    ? "outline-dashed outline-2 outline-red-600 outline-offset-4"
                    : ""
                }
                zoom={canvasZoom}
                setActiveObj={setActiveObj}
              />
            </div>
          ))}
        </div>
      </div>

      {showAlert_RemoveConfirmation && (
        <AlertScreen
          canvasSelected={canvasSelected}
          setCanvasSelected={setCanvasSelected}
          canvasIDs={canvasIDs}
          setCanvasIDs={setCanvasIDs}
          fabricCanvases={fabricCanvases}
          setC={setC}
          setShowAlert_RemoveConfirmation={setShowAlert_RemoveConfirmation}
        />
      )}

      <AlertTimeout
        showAlert={showAlert_NoSelected}
        setShowAlert={setShowAlert_NoSelected}
        text="No page selected"
      />

      <Link
        href={"https://github.com/qerplunk/img-pdf"}
        target="_blank"
        className="fixed right-0 top-0"
      >
        <p className="select-none rounded-bl-md bg-cyan-900 p-1 text-white">
          GitHub
        </p>
      </Link>
    </div>
  );
}
