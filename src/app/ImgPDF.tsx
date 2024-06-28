"use client";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { jsPDF } from "jspdf";
import Image from "next/image";
import Link from "next/link";

const defWidth = 794;
const defHeight = 1123;

const CanvasComponent = ({
  id,
  setCanvasSelected,
  setCanvases,
  classname,
  zoom,
}: {
  id: number;
  setCanvasSelected: Function;
  setCanvases: Function;
  classname: string;
  zoom: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: defWidth,
        height: defHeight,
        backgroundColor: "white",
      });
      fabricCanvasRef.current = canvas;

      setCanvases((prev: fabric.Canvas[]) =>
        Array.isArray(prev) ? [...prev, canvas] : [canvas],
      );

      canvas.on("mouse:down", () => {
        setCanvasSelected(id, canvas);
        canvas.renderAll();
      });
    }
  }, [id, setCanvasSelected, setCanvases]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;

      canvas.setZoom(zoom);
      canvas.setWidth(defWidth * canvas.getZoom());
      canvas.setHeight(defHeight * canvas.getZoom());
      canvas.renderAll();
    }
  }, [zoom]);

  return <canvas ref={canvasRef} id={id.toString()} className={classname} />;
};

const AlertTimeout = ({
  showAlert,
  setShowAlert,
}: {
  showAlert: boolean;
  setShowAlert: any;
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
      <p className="text-center text-lg text-neutral-100">Nothing selected</p>
    </div>
  );
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
  const [c, setC] = useState<fabric.Canvas[]>();

  const [canvases, setCanvases] = useState<number[]>([0]);
  const [nextBlankPage, setNextBlankPage] = useState<number>(1);
  const [selected, setSelected] = useState<{
    id: number;
    canvas: fabric.Canvas;
  }>();

  const [showAlert_RemoveConfirmation, setShowAlert_RemoveConfirmation] =
    useState<boolean>(false);
  const [showAlert_NoSelected, setShowAlert_NoSelected] =
    useState<boolean>(false);

  const setCanvasSelected = (id: number, canvas: fabric.Canvas) => {
    setSelected({ id, canvas });
  };

  const handleAddImage =
    (canvas: fabric.Canvas | undefined) => (event: any) => {
      if (selected?.id === -1 || selected?.id === undefined) {
        event.target.value = "";
        return;
      }

      if (canvas === undefined) {
        return;
      }

      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (f) {
        const data = f.target?.result;
        if (typeof data === "string") {
          fabric.Image.fromURL(data, (img) => {
            img.scaleToWidth(canvas.getWidth() / (canvasZoom * 1.2));
            if (img.getScaledHeight() > img.getScaledWidth()) {
              img.scaleToHeight(canvas.getHeight() / (canvasZoom * 1.2));
            }
            img.set({
              left: (canvas.getWidth() / canvasZoom - img.getScaledWidth()) / 2,
              top:
                (canvas.getHeight() / canvasZoom - img.getScaledHeight()) / 2,
            });
            canvas.add(img);
            canvas.requestRenderAll();
            canvas.renderAll();
          });
        }
      };

      if (file) {
        reader.readAsDataURL(file);
      }

      event.target.value = "";
    };

  return (
    <div className="flex min-h-screen w-full bg-stone-900 pb-28">
      <div
        id="SideMenu"
        className="fixed left-0 top-0 z-10 w-44 rounded-br-2xl bg-cyan-900 p-2"
      >
        <div className="sticky flex flex-col">
          <div id="RemoveObjectCanvas" className="pb-1">
            <button
              onClick={() => {
                if (selected !== undefined && selected.id !== -1) {
                  const activeOjb = selected.canvas.getActiveObject();
                  if (activeOjb) {
                    selected.canvas.remove(activeOjb);
                  } else {
                    if (selected.id !== -1 && canvases.length > 1) {
                      setShowAlert_RemoveConfirmation(true);
                      setShowAlert_NoSelected(false);
                    }
                  }
                } else {
                  setShowAlert_NoSelected(true);
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
          </div>

          <div id="AddImage" className="pb-1">
            <label
              htmlFor="image-upload"
              className="flex h-full w-full cursor-pointer select-none items-center justify-center rounded-md border-2 border-white text-3xl text-white hover:bg-red-500"
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

          <div id="AddPage" className="pb-1">
            {" "}
            <button
              onClick={() => {
                selected?.canvas.discardActiveObject().renderAll();
                setCanvases((prev) => [...prev, nextBlankPage]);
                setNextBlankPage((prev) => prev + 1);
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
            id="Download"
            className="h-12 rounded-md border-2 border-white px-6 text-lg text-white hover:bg-red-500"
            onClick={() => {
              const prevZoom = canvasZoom;
              const prevW = defWidth * canvasZoom;
              const prevH = defHeight * canvasZoom;

              const pdf = new jsPDF("p", "mm", "a4");
              c?.forEach((c, i) => {
                if (i >= 1) {
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
          <div id="Zoom" className="justify-center py-2">
            <p className="select-none text-center text-2xl text-white">Zoom</p>
            <span className="flex justify-center gap-4">
              <button
                className="w-12 rounded-xl border-2 border-white text-3xl text-white hover:bg-red-500"
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
                className="w-12 rounded-xl border-2 border-white text-3xl text-white hover:bg-red-500"
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
        <p className="select-none italic text-white">
          If pages disappear, zoom in or out to refresh
        </p>
      </div>

      <div className="flex w-full justify-center pt-10">
        <div id="Canvases" className="flex flex-col">
          {canvases.map((value, _) => (
            <div key={value} className="flex items-center pb-4">
              <p
                className={`select-none pr-2 text-xl text-red-500 ${selected?.id === value ? "" : "invisible"}`}
              >
                {"-->"}
              </p>
              <CanvasComponent
                id={value}
                setCanvasSelected={setCanvasSelected}
                setCanvases={setC}
                classname={
                  selected?.id === value
                    ? "outline-dashed outline-3 outline-red-500 outline-offset-4"
                    : ""
                }
                zoom={canvasZoom}
              />
            </div>
          ))}
        </div>
      </div>

      {showAlert_RemoveConfirmation && (
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
                  const remove_canvas_id = selected?.id;
                  setCanvases((prev) =>
                    prev.filter((id) => {
                      return id != remove_canvas_id;
                    }),
                  );

                  setC((prev) =>
                    prev?.filter((_, index) => {
                      return index != remove_canvas_id;
                    }),
                  );
                  setCanvasSelected(-1, c!.at(0)!);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertTimeout
        showAlert={showAlert_NoSelected}
        setShowAlert={setShowAlert_NoSelected}
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
