"use client";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { jsPDF } from "jspdf";
import Image from "next/image";

const defWidth = 794;
const defHeight = 1123;

const CanvasComponent = ({
  id,
  sel,
  setCanvases,
  classname,
  zoom,
}: {
  id: string;
  sel: Function;
  setCanvases: Function;
  classname: string;
  zoom: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: defWidth,
      height: defHeight,
      backgroundColor: "white",
    });
    fabricCanvasRef.current = canvas;

    setCanvases((prev: fabric.Canvas[]) =>
      Array.isArray(prev) ? [...prev, canvas] : [canvas],
    );

    sel(id, canvas);

    canvas.on("mouse:down", function (e) {
      sel(id, canvas);
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(zoom);
      fabricCanvasRef.current.setWidth(
        defWidth * fabricCanvasRef.current.getZoom(),
      );
      fabricCanvasRef.current.setHeight(
        defHeight * fabricCanvasRef.current.getZoom(),
      );
      fabricCanvasRef.current.renderAll();
    }
  }, [zoom]);

  return <canvas ref={canvasRef} id={id} className={classname} />;
};

export function ImgPDF() {
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = "#FF0000";
  fabric.Object.prototype.cornerStyle = "rect";
  fabric.Object.prototype.cornerStrokeColor = "#FFFFFF";
  fabric.Object.prototype.cornerSize = 12;
  fabric.Object.prototype.borderColor = "#FF0000";
  fabric.Object.prototype.borderScaleFactor = 2;

  const [canvasZoom, setCanvasZoom] = useState<number>(0.8);
  const [numCanvases, setNumCanvases] = useState(1);
  const [c, setC] = useState<fabric.Canvas[]>();

  const [selected, setSelected] = useState<{
    id: string;
    canvas: fabric.Canvas;
  }>();

  const setCanvas = (id: string, canvas: fabric.Canvas) => {
    setSelected({ id, canvas });
  };

  const handleAddImage =
    (canvas: fabric.Canvas | undefined) => (event: any) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (f) {
        const data = f.target?.result;
        if (typeof data === "string") {
          fabric.Image.fromURL(data, (img) => {
            img.scaleToWidth(canvas!.getWidth() / (canvasZoom * 1.2));
            if (img.getScaledHeight() > img.getScaledWidth()) {
              img.scaleToHeight(canvas!.getHeight() / (canvasZoom * 1.2));
            }
            img.set({
              left:
                (canvas!.getWidth() / canvasZoom - img.getScaledWidth()) / 2,
              top:
                (canvas!.getHeight() / canvasZoom - img.getScaledHeight()) / 2,
            });
            canvas?.add(img);
            canvas?.requestRenderAll();
            canvas?.renderAll();
          });
        }
      };

      if (file) {
        reader.readAsDataURL(file);
      }

      event.target.value = "";
    };

  return (
    <div>
      <div className="fixed left-0 top-0 z-10 w-48 rounded-br-2xl bg-red-700 p-2">
        <div className="sticky flex flex-col">
          <button
            onClick={() => {
              const activeOjb = selected?.canvas.getActiveObject();
              if (activeOjb) {
                selected?.canvas.remove(activeOjb);
              }
            }}
            className="flex h-full w-full flex-row items-center justify-center rounded-md border-2 border-white text-3xl text-white hover:bg-red-500"
          >
            {"-"}
            <Image
              src={"/assets/trash.png"}
              width={86}
              height={86}
              alt={"Trash"}
              priority={true}
            />
          </button>

          <div className="py-1">
            <label
              htmlFor="image-upload"
              className="flex h-full w-full cursor-pointer items-center justify-center rounded-md border-2 border-white text-3xl text-white hover:bg-red-500"
            >
              +
              <Image
                src={"/assets/new_image.png"}
                width={86}
                height={86}
                alt={"New image"}
                priority={true}
              />
            </label>

            <input
              id="image-upload"
              type="file"
              onChange={handleAddImage(selected?.canvas)}
              className="hidden"
            />
          </div>

          <div className="pb-1">
            <button
              onClick={() => {
                setNumCanvases((prev) => prev + 1);
                selected?.canvas.discardActiveObject().renderAll();
              }}
              className="flex h-full w-full flex-row items-center justify-center rounded-md border-2 border-white text-3xl text-white hover:bg-red-500"
            >
              +
              <Image
                src={"/assets/new_page.png"}
                width={86}
                height={86}
                alt={"New page"}
                priority={true}
              />
            </button>
          </div>

          <button
            className="h-14 rounded-md border-2 border-white px-6 text-lg text-white hover:bg-red-500"
            onClick={() => {
              const prevZoom = canvasZoom;
              const prevW = defWidth * canvasZoom;
              const prevH = defHeight * canvasZoom;

              const pdf = new jsPDF("p", "mm", "a4");
              c?.forEach((c, i) => {
                if (i % 2 === 0) {
                  return;
                }
                if (i > 1) {
                  pdf.addPage();
                }

                c.setZoom(1);
                c.setWidth(defWidth);
                c.setHeight(defHeight);
                c.renderAll();

                pdf.addImage(
                  c.toDataURL({
                    format: "image/jpeg",
                    quality: 1.0,
                    //multiplier: 1 / (canvasZoom + 0.2),
                  }),
                  "JPEG",
                  0,
                  0,
                  pdf.internal.pageSize.getWidth(),
                  pdf.internal.pageSize.getHeight(),
                );

                c.setZoom(prevZoom);
                c.setWidth(prevW);
                c.setHeight(prevH);
                c.renderAll();
              });
              pdf.save("img_combined.pdf");
            }}
          >
            {"IMG --> PDF"}
          </button>
          <div className="justify-center py-2">
            <p className="text-center text-2xl text-white">Zoom</p>
            <span className="flex justify-center gap-4">
              <button
                className="w-12 rounded-xl border-2 border-white text-3xl text-white"
                onClick={() => {
                  setCanvasZoom((prev) => {
                    let newZoom = prev + 0.1;
                    if (newZoom > 2) {
                      newZoom = 2;
                    }
                    return newZoom;
                  });
                }}
              >
                +
              </button>
              <button
                className="w-12 rounded-xl border-2 border-white text-3xl text-white"
                onClick={() => {
                  setCanvasZoom((prev) => {
                    let newZoom = prev - 0.1;
                    if (newZoom <= 0.3) {
                      newZoom = 0.3;
                    }
                    return newZoom;
                  });
                }}
              >
                -
              </button>
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-10">
        <div className="flex flex-col">
          {[...Array(numCanvases)].map((_, i) => (
            <div key={i}>
              <div className="flex items-center">
                <p
                  className={`pr-1 text-5xl font-bold text-red-500 ${
                    selected?.id === `canvas${i}` ? "" : "invisible"
                  }`}
                >
                  {"-->"}
                </p>
                <CanvasComponent
                  id={`canvas${i}`}
                  sel={setCanvas}
                  setCanvases={setC}
                  classname={`${selected?.id === `canvas${i}` ? "outline-dashed outline-3 outline-red-500 outline-offset-4" : ""}`}
                  zoom={canvasZoom}
                />
                <p className="pl-4 text-xl text-gray-200">{i + 1}</p>
              </div>
              <br />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
