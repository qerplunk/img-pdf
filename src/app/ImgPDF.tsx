"use client";
import { useEffect, useState } from "react";
import { fabric } from "fabric";
import Link from "next/link";
import { AlertScreen, AlertTimeout } from "./components/Alerts";
import { SideMenu } from "./components/SideMenu";
import { CanvasComponent } from "./components/CanvasComponent";
import { initializeFabricSettings } from "@/config/fabric";
import { useCanvasStore } from "@/utils/store";

export type CanvasType = {
  id: number;
  canvas: fabric.Canvas;
};

export function ImgPDF() {
  const canvasSelected = useCanvasStore((state) => state.canvasSelected);

  // Store fabric canvases, used to add images and export
  const [fabricCanvases, setC] = useState<fabric.Canvas[]>();

  // Store unique canvas IDs, used for rendering correct canvas
  const [canvasIDs, setCanvasIDs] = useState<number[]>([0]);

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
        canvases={canvasIDs}
        setShowAlert_RemoveConfirmation={setShowAlert_RemoveConfirmation}
        setShowAlert_NoSelected={setShowAlert_NoSelected}
        setCanvases={setCanvasIDs}
        fabricCanvases={fabricCanvases}
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
                setCanvasIDs={setC}
                classname={
                  canvasSelected?.id === value
                    ? "outline-dashed outline-2 outline-red-600 outline-offset-4"
                    : ""
                }
              />
            </div>
          ))}
        </div>
      </div>

      {showAlert_RemoveConfirmation && (
        <AlertScreen
          canvasIDs={canvasIDs}
          setCanvasIDs={setCanvasIDs}
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
