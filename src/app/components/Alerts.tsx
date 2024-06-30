import { useEffect, useState } from "react";

export const AlertScreen = ({
  canvasSelected,
  setCanvasSelected,
  canvasIDs,
  setCanvasIDs,
  fabricCanvases,
  setC,
  setShowAlert_RemoveConfirmation,
}: {
  canvasSelected: { id: number; canvas: fabric.Canvas } | undefined;
  setCanvasSelected: Function;
  canvasIDs: number[];
  setCanvasIDs: Function;
  fabricCanvases: fabric.Canvas[] | undefined;
  setC: Function;
  setShowAlert_RemoveConfirmation: Function;
}) => {
  return (
    <div id="Alert_RemoveConfirmation" className="fixed inset-0 z-10">
      <div
        className="absolute inset-0 bg-gray-400 opacity-50"
        onClick={() => {
          setShowAlert_RemoveConfirmation(false);
        }}
      ></div>
      <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-md bg-cyan-900 px-14 py-8">
        <p className="select-none text-center text-lg text-neutral-100">
          Delete page and its contents?
        </p>
        <div className="space-x-4 pt-4">
          <button
            className="w-20 rounded-md bg-gray-400 px-2 py-1 hover:bg-red-500"
            onClick={() => {
              setShowAlert_RemoveConfirmation(false);
            }}
          >
            No
          </button>
          <button
            className="w-20 rounded-md bg-gray-400 px-2 py-1 hover:bg-red-500"
            onClick={() => {
              setShowAlert_RemoveConfirmation(false);
              const remove_canvas_id = canvasSelected?.id;

              let remove_page_num = 0;
              canvasIDs.map((value, index) => {
                if (remove_canvas_id === value) {
                  remove_page_num = index;
                  return;
                }
              });

              setCanvasIDs((prev: number[]) =>
                prev.filter((id) => {
                  return id !== remove_canvas_id;
                }),
              );

              setC((prev: fabric.Canvas[]) =>
                prev.filter((_, index) => {
                  return index !== remove_page_num;
                }),
              );
              // Setting the 0th canvas as a temporary canvas, as -1 makes it ignore it either way
              setCanvasSelected({ id: -1, canvas: fabricCanvases!.at(0)! });
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export const AlertTimeout = ({
  showAlert,
  setShowAlert,
  text,
}: {
  showAlert: boolean;
  setShowAlert: any;
  text: string;
}) => {
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showAlert, setShowAlert]);

  if (!showAlert) return null;

  return (
    <div className="fixed left-1/2 top-0 flex -translate-x-1/2 flex-col items-center rounded-b-md bg-cyan-900 px-14 py-3">
      <p className="text-center text-lg text-neutral-100">{text}</p>
    </div>
  );
};
