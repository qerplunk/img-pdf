"use client";
import { useEffect, useState } from "react";
import { fabric } from "fabric";
import Link from "next/link";
import { AlertScreen, AlertTimeout } from "./components/Alerts";
import { SideMenu } from "./components/SideMenu";
import { CanvasComponent } from "./components/CanvasComponent";
import { initializeFabricSettings } from "@/config/fabric";

export function ImgPDF() {
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

  useEffect(() => {
    initializeFabricSettings();
  }, []);

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
