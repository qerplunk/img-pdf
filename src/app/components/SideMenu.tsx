"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";
import { fabric } from "fabric";
import Image from "next/image";
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PDF_COMPRESSION,
  PDF_IMAGE_MULTIPLIER,
  PDF_IMAGE_QUALITY,
} from "@/config/pdfDocument";
import { useCanvasStore } from "@/utils/store";
import { CanvasType } from "./CanvasComponent";

const handleAddImage =
  (canvasSelected: CanvasType | undefined, canvasZoom: number) =>
  (event: any) => {
    if (!canvasSelected) {
      event.target.value = "";
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

export const SideMenu = () => {
  const [fileName, setFilename] = useState<string>("img_combined");

  const canvasZoom = useCanvasStore((state) => state.canvasZoom);
  const increaseZoom = useCanvasStore((state) => state.increaseCanvasZoom);
  const decreaseZoom = useCanvasStore((state) => state.decreaseCanvasZoom);

  const canvasSelected = useCanvasStore((state) => state.canvasSelected);
  const setCanvasSelected = useCanvasStore((state) => state.setCanvasSelected);

  const incrementValidContactIDs = useCanvasStore(
    (state) => state.incrementValidCanvasIDs,
  );

  const objectIsSelected = useCanvasStore((state) => state.objectIsSelected);
  const validCanvasIDs = useCanvasStore((state) => state.validCanvasIDs);

  const fabricCanvases = useCanvasStore((state) => state.fabricCanvases);

  const setShowNoSelection = useCanvasStore(
    (state) => state.setShowNoSelection,
  );
  const setShowRemovePage = useCanvasStore((state) => state.setShowRemovePage);

  return (
    <div
      id="SideMenu"
      className="fixed left-0 top-0 z-10 w-40 rounded-br-2xl bg-cyan-900 p-2"
    >
      <div className="sticky flex flex-col">
        <div id="RemoveObjectCanvas" className="pb-1">
          <button
            onClick={() => {
              if (canvasSelected) {
                const activeObjectSelected =
                  canvasSelected.canvas.getActiveObject();
                if (activeObjectSelected) {
                  canvasSelected.canvas.remove(activeObjectSelected);
                } else {
                  if (validCanvasIDs.length > 1) {
                    setShowRemovePage(true);
                    setShowNoSelection(false);
                  }
                }
              } else {
                setShowNoSelection(true);
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
            htmlFor={canvasSelected ? "image-upload" : ""}
            className="flex h-full w-full cursor-pointer select-none items-center justify-center rounded-sm border-2 border-white text-3xl text-white hover:bg-red-500"
            onClick={() => {
              console.log("Adding new image");
              if (!canvasSelected) {
                console.log("No canvas selected");
                setShowNoSelection(true);
              } else {
                console.log("Canvas selected");
                setShowNoSelection(false);
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
              incrementValidContactIDs();
              setCanvasSelected(undefined);
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

            fabricCanvases.forEach((canvas, pageNumber) => {
              if (pageNumber >= 1) {
                pdf.addPage();
              }

              canvas.setZoom(1);
              canvas.setWidth(PAGE_WIDTH);
              canvas.setHeight(PAGE_HEIGHT);

              pdf.addImage({
                imageData: canvas.toDataURL({
                  format: "image/jpeg",
                  quality: PDF_IMAGE_QUALITY,
                  multiplier: PDF_IMAGE_MULTIPLIER,
                }),
                format: "JPEG",
                x: 0,
                y: 0,
                width: pdf.internal.pageSize.getWidth(),
                height: pdf.internal.pageSize.getHeight(),
                alias: "",
                compression: PDF_COMPRESSION,
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
            alt={"New image"}
            priority={true}
          />
          <p className="whitespace-nowrap">{"--> PDF"}</p>
        </button>
        <div id="Zoom" className="justify-center py-2">
          <p className="select-none text-center text-xl text-white">Zoom</p>
          <span className="flex justify-center gap-x-4">
            <button
              className="w-12 rounded-lg border-2 border-white text-2xl text-white hover:bg-red-500"
              onClick={increaseZoom}
            >
              +
            </button>
            <button
              className="w-12 rounded-lg border-2 border-white text-2xl text-white hover:bg-red-500"
              onClick={decreaseZoom}
            >
              -
            </button>
          </span>
        </div>
      </div>
      <div
        className={`w-full space-y-1 text-white ${!objectIsSelected && "hidden"}`}
      >
        <p className="select-none text-center text-xl">Image settings</p>
        <button
          className="w-full border-2 border-white hover:bg-red-500"
          onClick={() => {
            if (!canvasSelected) {
              return;
            }

            canvasSelected.canvas.getActiveObject()?.bringForward();
          }}
        >
          Move forward
        </button>
        <button
          className="w-full border-2 border-white hover:bg-red-500"
          onClick={() => {
            if (!canvasSelected) {
              return;
            }
            canvasSelected.canvas.getActiveObject()?.sendBackwards();
          }}
        >
          Move backwards
        </button>
        <button
          className="w-full border-2 border-white hover:bg-red-500"
          onClick={() => {
            if (canvasSelected) {
              const img = canvasSelected.canvas.getActiveObject();
              if (!img) {
                return;
              }

              img.set({
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
              if (!img) {
                return;
              }

              img.set({
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
