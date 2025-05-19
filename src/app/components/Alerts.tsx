import { useEffect } from "react";
import { useCanvasStore } from "@/utils/store";

export const AlertScreen = () => {
  const canvasSelected = useCanvasStore((state) => state.canvasSelected);
  const validCanvasIDs = useCanvasStore((state) => state.validCanvasIDs);

  const setCanvasSelected = useCanvasStore((state) => state.setCanvasSelected);
  const invalidateID = useCanvasStore((state) => state.invalidateCanvasID);
  const removeCanvasByIndex = useCanvasStore(
    (state) => state.removeCanvasByIndex,
  );
  const setShowRemovePage = useCanvasStore((state) => state.setShowRemovePage);

  const handleDeletePage = () => {
    setShowRemovePage(false);
    if (!canvasSelected) {
      return;
    }

    const removeCanvasID = canvasSelected.id;
    let removePageNum = validCanvasIDs.findIndex((c) => c === removeCanvasID);

    invalidateID(removeCanvasID);
    removeCanvasByIndex(removePageNum);

    setCanvasSelected(undefined);
  };

  return (
    <div id="Alert_RemoveConfirmation" className="fixed inset-0 z-10">
      <div
        className="absolute inset-0 bg-gray-400 opacity-50"
        onClick={() => {
          setShowRemovePage(false);
        }}
      />
      <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-md bg-cyan-900 px-14 py-8">
        <p className="select-none text-center text-lg text-neutral-100">
          Delete page and its contents?
        </p>
        <div className="space-x-4 pt-4">
          <button
            className="w-20 rounded-md bg-gray-400 px-2 py-1 hover:bg-red-500"
            onClick={() => {
              setShowRemovePage(false);
            }}
          >
            No
          </button>
          <button
            className="w-20 rounded-md bg-gray-400 px-2 py-1 hover:bg-red-500"
            onClick={handleDeletePage}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

type AlertTimeoutProps = {
  text: string;
};

export const AlertTimeout = ({ text }: AlertTimeoutProps) => {
  const showNoSelection = useCanvasStore((state) => state.showNoSelection);
  const setShowNoSelection = useCanvasStore(
    (state) => state.setShowNoSelection,
  );

  useEffect(() => {
    if (showNoSelection) {
      const timer = setTimeout(() => {
        setShowNoSelection(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showNoSelection, setShowNoSelection]);

  return (
    <div className="fixed left-1/2 top-0 flex -translate-x-1/2 flex-col items-center rounded-b-md bg-cyan-900 px-14 py-3">
      <p className="text-center text-lg text-neutral-100">{text}</p>
    </div>
  );
};
