import { fabric } from "fabric";

export function initializeFabricSettings() {
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = "#FF0000";
  fabric.Object.prototype.cornerStyle = "rect";
  fabric.Object.prototype.cornerStrokeColor = "#FFFFFF";
  fabric.Object.prototype.cornerSize = 12;
  fabric.Object.prototype.borderColor = "#FF0000";
  fabric.Object.prototype.borderScaleFactor = 2;
  fabric.Object.prototype.hasRotatingPoint = true;
  fabric.Object.prototype.rotatingPointOffset = 0.1;
}
