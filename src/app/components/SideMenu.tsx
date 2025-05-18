import { useState } from "react";
import { jsPDF } from "jspdf";
import { fabric } from "fabric";
import Image from "next/image";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from "@/config/pdfDocument";

const handleAddImage =
  (
    canvasSelected: { id: number; canvas: fabric.Canvas } | undefined,
    canvasZoom: number,
  ) =>
  (event: any) => {
    if (canvasSelected?.id === -1 || !canvasSelected?.id) {
      event.target.value = "";
      return;
    }

    if (!canvasSelected.canvas) {
      return;
    }

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (f) {
      const data = f.target?.result;
      if (typeof data === "string") {
        fabric.Image.fromURL(data, (img) => {
          img.scaleToWidth(
            canvasSelected.canvas.getWidth() / (canvasZoom * 1.05),
          );
          if (img.getScaledHeight() > img.getScaledWidth()) {
            img.scaleToHeight(
              canvasSelected.canvas.getHeight() / (canvasZoom * 1.05),
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

type SideMenuProps = {
  canvasSelected?: { id: number; canvas: fabric.Canvas };
  canvases: number[];
  setShowAlert_RemoveConfirmation: Function;
  setShowAlert_NoSelected: Function;
  setCanvases: Function;
  nextBlankID: number;
  setNextBlankID: Function;
  canvasZoom: number;
  fabricCanvases?: fabric.Canvas[];
  setCanvasZoom: Function;
  activeObj: boolean;
};

export const SideMenu = ({
  canvasSelected,
  canvases,
  setShowAlert_RemoveConfirmation,
  setShowAlert_NoSelected,
  setCanvases,
  nextBlankID,
  setNextBlankID,
  canvasZoom,
  fabricCanvases,
  setCanvasZoom,
  activeObj,
}: SideMenuProps) => {
  const [fileName, setFilename] = useState<string>("img_combined");

  return (
    <div
      id="SideMenu"
      className="fixed left-0 top-0 z-10 w-40 rounded-br-2xl bg-cyan-900 p-2"
    >
      <div className="sticky flex flex-col">
        <div id="RemoveObjectCanvas" className="pb-1">
          <button
            onClick={() => {
              if (canvasSelected && canvasSelected.id !== -1) {
                const activeOjbSelected =
                  canvasSelected.canvas.getActiveObject();
                if (activeOjbSelected) {
                  canvasSelected.canvas.remove(activeOjbSelected);
                } else {
                  if (canvases?.length > 1) {
                    setShowAlert_RemoveConfirmation(true);
                    setShowAlert_NoSelected(false);
                  }
                }
              } else {
                setShowAlert_NoSelected(true);
              }
            }}
            className="flex h-full w-full flex-row items-center justify-center rounded-sm border-2 border-white text-3xl text-white hover:bg-red-500"
          >
            <Image
              src={"/assets/trash.png"}
              width={70}
              height={70}
              alt={"Trash"}
              priority={true}
            />
          </button>
        </div>

        <div id="AddImage" className="pb-1">
          <label
            htmlFor={
              canvasSelected && canvasSelected.id !== -1 ? "image-upload" : ""
            }
            className="flex h-full w-full cursor-pointer select-none items-center justify-center rounded-sm border-2 border-white text-3xl text-white hover:bg-red-500"
            onClick={() => {
              if (!canvasSelected || canvasSelected?.id === -1) {
                setShowAlert_NoSelected(true);
              } else {
                setShowAlert_NoSelected(false);
              }
            }}
          >
            +
            <Image
              src={"/assets/new_image.png"}
              width={70}
              height={70}
              alt={"New image"}
              priority={true}
            />
          </label>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleAddImage(canvasSelected, canvasZoom)}
            className="hidden"
          />
        </div>

        <div id="AddPage" className="pb-1">
          <button
            onClick={() => {
              canvasSelected?.canvas.discardActiveObject().renderAll();
              setCanvases((prev: fabric.Canvas[]) => [...prev, nextBlankID]);
              setNextBlankID((prev: number) => prev + 1);
            }}
            className="flex h-full w-full flex-row items-center justify-center rounded-sm border-2 border-white text-3xl text-white hover:bg-red-500"
          >
            +
            <Image
              src={"/assets/new_page.png"}
              width={70}
              height={70}
              alt={"New page"}
              priority={true}
            />
          </button>
        </div>

        <div id="filename" className="pb-1 text-center">
          <label htmlFor="filename-input" className="text-white">
            Save as:
          </label>
          <input
            id="filename-input"
            className="h-8 w-full border-2 border-white bg-gray-800 px-2 text-sm text-white"
            placeholder="img_combined.pdf"
            onChange={(e) => {
              setFilename(e.target.value);
            }}
          />
        </div>

        <button
          id="Download"
          className="flex h-12 flex-row items-center justify-center rounded-sm border-2 border-white text-lg text-white hover:bg-red-500"
          onClick={() => {
            const prevZoom = canvasZoom;
            const prevW = PAGE_WIDTH * canvasZoom;
            const prevH = PAGE_HEIGHT * canvasZoom;

            const pdf = new jsPDF("p", "mm", "letter", true);

            fabricCanvases?.forEach((canvas, pageNumber) => {
              if (pageNumber >= 1) {
                pdf.addPage();
              }

              canvas.setZoom(1);
              canvas.setWidth(PAGE_WIDTH);
              canvas.setHeight(PAGE_HEIGHT);

              pdf.addImage({
                imageData: canvas.toDataURL({
                  format: "image/jpeg",
                  quality: 1.0,
                  multiplier: 1.7,
                }),
                format: "JPEG",
                x: 0,
                y: 0,
                width: pdf.internal.pageSize.getWidth(),
                height: pdf.internal.pageSize.getHeight(),
                alias: "",
                compression: "MEDIUM",
              });

              canvas.setZoom(prevZoom);
              canvas.setWidth(prevW);
              canvas.setHeight(prevH);
            });

            const splitFilename = fileName.split(".");
            let finalName = fileName;
            let finalExtension = "";

            const extension = splitFilename[splitFilename.length - 1];
            if (extension !== "pdf") {
              finalExtension = ".pdf";
            }

            if (splitFilename[0] === "") {
              finalName = "img_combined";
              finalExtension = ".pdf";
            }

            pdf.save(finalName + finalExtension);
          }}
        >
          <Image
            src={"/assets/new_image.png"}
            width={40}
            height={40}
            alt={"New page"}
            priority={true}
          />
          <p className="whitespace-nowrap">{"--> PDF"}</p>
        </button>
        <div id="Zoom" className="justify-center py-2">
          <p className="select-none text-center text-xl text-white">Zoom</p>
          <span className="flex justify-center gap-x-4">
            <button
              className="w-12 rounded-lg border-2 border-white text-2xl text-white hover:bg-red-500"
              onClick={() => {
                setCanvasZoom((prev: number) => {
                  let newZoom = Math.min(MAX_ZOOM, prev + 0.1);
                  return newZoom;
                });
              }}
            >
              +
            </button>
            <button
              className="w-12 rounded-lg border-2 border-white text-2xl text-white hover:bg-red-500"
              onClick={() => {
                setCanvasZoom((prev: number) => {
                  let newZoom = Math.max(MIN_ZOOM, prev - 0.1);
                  return newZoom;
                });
              }}
            >
              -
            </button>
          </span>
        </div>
      </div>
      <div className={`w-full space-y-1 text-white ${!activeObj && "hidden"}`}>
        <p className="select-none text-center text-xl">Image settings</p>
        <button
          className="w-full border-2 border-white hover:bg-red-500"
          onClick={() => {
            canvasSelected?.canvas.getActiveObject()?.bringForward();
          }}
        >
          Move forward
        </button>
        <button
          className="w-full border-2 border-white hover:bg-red-500"
          onClick={() => {
            canvasSelected?.canvas.getActiveObject()?.sendBackwards();
          }}
        >
          Move backwards
        </button>
        <button
          className="w-full border-2 border-white hover:bg-red-500"
          onClick={() => {
            if (canvasSelected) {
              const img = canvasSelected.canvas.getActiveObject();

              img?.set({
                left:
                  (canvasSelected.canvas.getWidth() / canvasZoom -
                    img.getScaledWidth()) /
                  2,
              });
              canvasSelected.canvas.renderAll();
            }
          }}
        >
          {"Center ↔"}
        </button>
        <button
          className="w-full border-2 border-white hover:bg-red-500"
          onClick={() => {
            if (canvasSelected) {
              const img = canvasSelected.canvas.getActiveObject();

              img?.set({
                top:
                  (canvasSelected.canvas.getHeight() / canvasZoom -
                    img.getScaledHeight()) /
                  2,
              });
              canvasSelected.canvas.renderAll();
            }
          }}
        >
          {"Center ↕"}
        </button>
      </div>
    </div>
  );
};
