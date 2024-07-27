"use client";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import Link from "next/link";
import { AlertScreen, AlertTimeout } from "./components/Alerts";
import { SideMenu } from "./components/SideMenu";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./PDF_Settings";

const handleAddImage =
  (
    canvasSelected: { id: number; canvas: fabric.Canvas } | undefined,
    canvasZoom: number,
  ) =>
  (event: any) => {
    if (canvasSelected?.id === -1 || canvasSelected?.id === undefined) {
      event.target.value = "";
      return;
    }

    if (canvasSelected.canvas === undefined) {
      return;
    }

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (f) {
      const data = f.target?.result;
      if (typeof data === "string") {
        fabric.Image.fromURL(data, (img) => {
          img.scaleToWidth(
            canvasSelected.canvas.getWidth() / (canvasZoom * 1.2),
          );
          if (img.getScaledHeight() > img.getScaledWidth()) {
            img.scaleToHeight(
              canvasSelected.canvas.getHeight() / (canvasZoom * 1.2),
            );
          }
          img.set({
            left:
              (canvasSelected.canvas.getWidth() / canvasZoom -
                img.getScaledWidth()) /
              2,
            top:
              (canvasSelected.canvas.getHeight() / canvasZoom -
                img.getScaledHeight()) /
              2,
          });
          canvasSelected.canvas.add(img);
          canvasSelected.canvas.setActiveObject(img);
          canvasSelected.canvas.renderAll();
        });
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }

    event.target.value = "";
  };

const CanvasComponent = ({
  id,
  setCanvasSelected,
  setCanvasIDs,
  classname,
  zoom,
}: {
  id: number;
  setCanvasSelected: Function;
  setCanvasIDs: Function;
  classname: string;
  zoom: number;
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

      setCanvasIDs((prev: fabric.Canvas[]) =>
        Array.isArray(prev) ? [...prev, canvas] : [canvas],
      );

      canvas.on("mouse:down", () => {
        setCanvasSelected({ id: id, canvas: canvas });
        canvas.renderAll();
      });
    }
  }, [id, setCanvasSelected, setCanvasIDs]);

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
        handleAddImage={handleAddImage}
      />

      <div className="flex w-full justify-center pt-10">
        <div id="Canvases" className="flex flex-col">
          {canvasIDs.map((value, _) => (
            <div key={value} className="flex items-center pb-4">
              <p
                className={`select-none pr-2 text-xl text-red-600 ${canvasSelected?.id === value ? "" : "invisible"}`}
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
              />
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-0 h-80 w-36 bg-red-500">
        <button
          onClick={() => {
            canvasSelected?.canvas.getActiveObject()?.bringForward();
          }}
        >
          Move forward
        </button>
        <button
          onClick={() => {
            canvasSelected?.canvas.getActiveObject()?.bringToFront();
          }}
        >
          Send to top
        </button>
        <button
          onClick={() => {
            canvasSelected?.canvas.getActiveObject()?.sendBackwards();
          }}
        >
          Move backwards
        </button>
        <button
          onClick={() => {
            canvasSelected?.canvas.getActiveObject()?.sendToBack();
          }}
        >
          Send to bottom
        </button>
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
        className="absolute right-0 top-0"
      >
        <p className="select-none rounded-bl-md bg-cyan-900 p-1 text-white">
          GitHub
        </p>
      </Link>
    </div>
  );
}
