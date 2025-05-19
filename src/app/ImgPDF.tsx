"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertScreen, AlertTimeout } from "./components/Alerts";
import { SideMenu } from "./components/SideMenu";
import { CanvasComponent } from "./components/CanvasComponent";
import { initializeFabricSettings } from "@/config/fabric";
import { useCanvasStore } from "@/utils/store";

export function ImgPDF() {
  const canvasSelected = useCanvasStore((state) => state.canvasSelected);
  const validCanvasIDs = useCanvasStore((state) => state.validCanvasIDs);
  const showRemovePage = useCanvasStore((state) => state.showRemovePage);
  const showNoSelection = useCanvasStore((state) => state.showNoSelection);

  useEffect(() => {
    initializeFabricSettings();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-stone-900 pb-28">
      <SideMenu />

      <div className="flex w-full justify-center pt-10">
        <div id="Canvases" className="flex flex-col">
          {validCanvasIDs.map((value, _) => (
            <div key={value} className="flex items-center pb-4">
              <p
                className={`select-none whitespace-nowrap pr-2 text-xl text-red-600 ${canvasSelected?.id === value ? "" : "invisible"}`}
              >
                {"-->"}
              </p>
              <CanvasComponent
                id={value}
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

      {showRemovePage && <AlertScreen />}
      {showNoSelection && <AlertTimeout text="No page selected" />}

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
